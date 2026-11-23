import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { navFor } from '@/components/layout/nav';
import { chooseOrganization } from '@/context/organization-context';
import { uploadAttachment, validateFile } from '@/features/attachments/api';
import { describeAction } from '@/features/audit/describe';
import { fetchSession, registerBusiness, signIn } from '@/features/auth/api';
import { listTickets } from '@/features/tickets/api';
import { buildTicketRequest, emptyTicketForm } from '@/features/tickets/new-ticket';
import { assigneeHint, canAssign, canWork, nextStatuses } from '@/features/tickets/permissions';
import { extractTrackingToken, getPublicTicket, postPublicReply } from '@/features/tracking/api';
import { ApiError, api, request, setActiveOrganization, setUnauthorizedHandler } from '@/lib/api/client';
import { parsePortalDomains, resolvePortalSlug } from '@/lib/portal-domains';
import { getToken, setToken } from '@/lib/session';
import { safeNext } from '@/lib/utils';
import type { AuditEntry, Contact, OrganizationMembership } from '@/types/api';
import { installBrowser, json, mockFetch } from './setup';

const TOKEN = 'A'.repeat(43);

beforeEach(() => {
  installBrowser();
  setActiveOrganization(null);
});
afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

// ---------------------------------------------------------------- authentication
describe('authentication', () => {
  it('sign-in keeps the bearer token from set-auth-token and restores the session without a role', async () => {
    const calls = mockFetch((url) =>
      url.endsWith('/sign-in/email')
        ? json({ user: { id: 'u1' } }, 200, { 'set-auth-token': 'session-token' })
        : json({ user: { id: 'u1', name: 'Wanjiru', email: 'w@x.co.ke', tenantId: 'legacy', role: 'ADMIN' } }),
    );
    await signIn('w@x.co.ke', 'password123');
    expect(getToken()).toBe('session-token');
    expect(calls[0]!.init.headers.Authorization).toBeUndefined(); // public call: no stale token sent

    const user = await fetchSession();
    expect(user).toEqual({ id: 'u1', name: 'Wanjiru', email: 'w@x.co.ke' }); // roles never come from the session
    expect(calls[1]!.init.headers.Authorization).toBe('Bearer session-token');
    expect(calls[1]!.init.headers['X-Organization-Id']).toBeUndefined();
  });

  it('business registration posts to /api/auth/register and signs the owner in', async () => {
    const calls = mockFetch(() => json({ user: { id: 'u1' }, organization: { id: 'abc-internet', name: 'ABC Internet', logo: null, role: 'ADMIN', createdAt: '2026-01-01' } }, 201, { 'set-auth-token': 't1' }));
    const org = await registerBusiness({ name: 'Owner', email: 'o@abc.co.ke', password: 'password123', organizationName: 'ABC Internet' });
    expect(calls[0]!.url).toMatch(/\/api\/auth\/register$/);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ name: 'Owner', email: 'o@abc.co.ke', password: 'password123', organizationName: 'ABC Internet' });
    expect(org).toMatchObject({ id: 'abc-internet', role: 'ADMIN' });
    expect(getToken()).toBe('t1');
  });

  it('a 401 on an authenticated call clears the token and notifies the app; network failures do not', async () => {
    setToken('stale');
    setActiveOrganization('acme');
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    mockFetch(() => json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing session' } }, 401));
    await expect(api('/api/v1/tickets')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
    expect(getToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();

    setToken('valid');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api('/api/v1/tickets')).rejects.toMatchObject({ code: 'NETWORK' });
    expect(getToken()).toBe('valid'); // a flaky connection never logs anyone out
  });

  it('requests time out instead of hanging forever', async () => {
    setActiveOrganization('acme');
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => new Promise((_, reject) => init.signal!.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))),
    );
    await expect(request('/api/v1/tickets', { timeoutMs: 20 })).rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('post-login redirects stay on this site (no open redirects)', () => {
    expect(safeNext('/app/tickets?status=OPEN')).toBe('/app/tickets?status=OPEN');
    for (const evil of ['//evil.com', '/\\evil.com', '/\\/evil.com', 'https://evil.com', '/%0d%0a', '/\tevil', null, '']) {
      expect(safeNext(evil as string)).toBe(evil === '/%0d%0a' ? '/%0d%0a' : '/app/dashboard');
    }
  });
});

// ---------------------------------------------------------------- organization selection
describe('organization selection', () => {
  const orgs: OrganizationMembership[] = [
    { id: 'acme', name: 'Acme', logo: null, role: 'AGENT', joinedAt: '' },
    { id: 'globex', name: 'Globex', logo: null, role: 'ADMIN', joinedAt: '' },
  ];

  it('remembers the last organization while the user still belongs to it, else falls back to the first', () => {
    expect(chooseOrganization(orgs, 'globex')?.id).toBe('globex');
    expect(chooseOrganization(orgs, 'removed-org')?.id).toBe('acme');
    expect(chooseOrganization(orgs, null)?.id).toBe('acme');
    expect(chooseOrganization([], 'acme')).toBeNull();
  });

  it('every organization-scoped request carries X-Organization-Id; none is sent without one selected', async () => {
    setToken('t');
    const calls = mockFetch(() => json({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 }));
    await expect(listTickets({})).rejects.toMatchObject({ code: 'NO_ORGANIZATION' });
    expect(calls).toHaveLength(0);

    setActiveOrganization('acme');
    await listTickets({ status: 'OPEN' });
    setActiveOrganization('globex');
    await listTickets({ q: 'refund' });
    expect(calls.map((c) => c.init.headers['X-Organization-Id'])).toEqual(['acme', 'globex']);
    expect(calls[1]!.url).toContain('/api/v1/tickets/search?q=refund');
  });
});

// ---------------------------------------------------------------- role-based navigation
describe('role-based navigation', () => {
  it('admins see team, settings and audit; agents see the ticket work only', () => {
    expect(navFor('ADMIN').map((i) => i.label)).toEqual(['Dashboard', 'Tickets', 'Contacts', 'Team', 'Settings', 'Audit log']);
    expect(navFor('AGENT').map((i) => i.label)).toEqual(['Dashboard', 'Tickets', 'Contacts']);
  });
});

// ---------------------------------------------------------------- ticket creation
describe('ticket creation', () => {
  const contact = { contactId: 7, name: 'Amina' } as Contact;

  it('builds the v2 body for an existing contact', () => {
    const r = buildTicketRequest({ ...emptyTicketForm(), contact: { mode: 'existing', contact }, title: ' Late order ', description: 'Not delivered', channel: 'WHATSAPP', orderRef: ' 1042 ', assigneeId: 'u2', priority: 'HIGH', type: 'DELIVERY' });
    expect(r.input).toEqual({ contactId: 7, title: 'Late order', description: 'Not delivered', channel: 'WHATSAPP', orderRef: '1042', assigneeId: 'u2', priority: 'HIGH', type: 'DELIVERY' });
  });

  it('builds the v2 body for a new contact, normalising the phone like the backend', () => {
    const r = buildTicketRequest({ ...emptyTicketForm(), contact: { mode: 'new', name: ' Kevin ', phone: '0712 345-678', email: '' }, title: 'x', description: 'y', channel: 'PHONE' });
    expect(r.input).toEqual({ contact: { name: 'Kevin', phone: '0712345678' }, title: 'x', description: 'y', channel: 'PHONE', priority: 'NORMAL', type: 'OTHER' });
  });

  it('rejects a missing contact, channel, subject or a bad phone before calling the API', () => {
    expect(Object.keys(buildTicketRequest(emptyTicketForm()).errors ?? {}).sort()).toEqual(['channel', 'contact', 'description', 'title']);
    const bad = buildTicketRequest({ ...emptyTicketForm(), contact: { mode: 'new', name: 'K', phone: 'call me', email: 'nope' }, title: 'x', description: 'y', channel: 'EMAIL' });
    expect(bad.errors).toMatchObject({ phone: expect.any(String), email: expect.any(String) });
  });
});

// ---------------------------------------------------------------- status changes
describe('status changes', () => {
  const agent = { id: 'u1', role: 'AGENT' as const };
  const admin = { id: 'a1', role: 'ADMIN' as const };

  it('offers the backend transitions, including waiting on the customer and reopening; closed is final', () => {
    expect(nextStatuses('OPEN')).toEqual(['IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED']);
    expect(nextStatuses('IN_PROGRESS')).toEqual(['WAITING_ON_CUSTOMER', 'RESOLVED']);
    expect(nextStatuses('RESOLVED')).toEqual(['CLOSED', 'IN_PROGRESS']);
    expect(nextStatuses('CLOSED')).toEqual([]);
  });

  it('mirrors the backend ownership rules', () => {
    expect(canWork(agent, { status: 'OPEN', assigneeId: null })).toBe(true); // unassigned: anyone
    expect(canWork(agent, { status: 'IN_PROGRESS', assigneeId: 'u1' })).toBe(true);
    expect(canWork(agent, { status: 'IN_PROGRESS', assigneeId: 'u2' })).toBe(false);
    expect(canAssign(admin, { status: 'IN_PROGRESS', assigneeId: 'u2' })).toBe(true);
    expect(canWork(admin, { status: 'CLOSED', assigneeId: 'a1' })).toBe(false);
    expect(assigneeHint(agent, { status: 'OPEN', assigneeId: null }, 'IN_PROGRESS')).toMatch(/assigns the ticket to you/);
    expect(assigneeHint(admin, { status: 'OPEN', assigneeId: null }, 'WAITING_ON_CUSTOMER')).toMatch(/Assign someone first/);
    expect(assigneeHint(admin, { status: 'OPEN', assigneeId: null }, 'RESOLVED')).toBeNull();
  });
});

// ---------------------------------------------------------------- attachment upload
describe('attachment upload', () => {
  it('sends the real FormData body and lets the browser set the multipart boundary', async () => {
    setToken('t');
    setActiveOrganization('acme');
    const calls = mockFetch(() => json({ attachmentId: 1 }, 201));
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'receipt.pdf');
    await uploadAttachment(42, file, 'PUBLIC');

    const { url, init } = calls[0]!;
    expect(url).toMatch(/\/api\/v1\/tickets\/42\/attachments\?visibility=PUBLIC$/);
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    const sent = (init.body as FormData).get('file') as File;
    expect(sent.name).toBe('receipt.pdf');
    expect(sent.type).toBe('application/pdf');
    expect(Object.keys(init.headers).map((h) => h.toLowerCase())).not.toContain('content-type');
    expect(init.headers['X-Organization-Id']).toBe('acme');
  });

  it('validates type, size and count before uploading', () => {
    const ok = new File(['x'], 'a.png');
    expect(validateFile(ok, 0)).toBeNull();
    expect(validateFile(new File(['x'], 'run.exe'), 0)).toMatch(/Unsupported/);
    expect(validateFile(new File([], 'a.png'), 0)).toMatch(/empty/);
    expect(validateFile(ok, 10)).toMatch(/maximum/);
  });
});

// ---------------------------------------------------------------- public ticket tracking
describe('public ticket tracking', () => {
  it('sends only the token: never the staff session or organization, even when someone is signed in', async () => {
    setToken('staff-session');
    setActiveOrganization('acme');
    const calls = mockFetch((_, init) => (init.method === 'POST' ? json({ commentId: 1 }, 201) : json({ ticket: {}, comments: [] })));
    await getPublicTicket(TOKEN);
    await postPublicReply(TOKEN, 'Still waiting');
    for (const c of calls) {
      expect(c.url).toContain(`/api/v1/public/tickets/${TOKEN}`);
      expect(c.init.headers.Authorization).toBeUndefined();
      expect(c.init.headers['X-Organization-Id']).toBeUndefined();
    }
    expect(JSON.parse(calls[1]!.init.body as string)).toEqual({ text: 'Still waiting' });
  });

  it('an invalid or expired link surfaces as a 404 ApiError', async () => {
    mockFetch(() => json({ error: { code: 'TRACKING_LINK_INVALID', message: 'expired' } }, 404));
    const err = await getPublicTicket(TOKEN).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 404, code: 'TRACKING_LINK_INVALID' });
  });

  it('the support portal accepts a pasted link or a bare token', () => {
    expect(extractTrackingToken(`https://support.abc.co.ke/track/${TOKEN}`)).toBe(TOKEN);
    expect(extractTrackingToken(`  ${TOKEN} `)).toBe(TOKEN);
    expect(extractTrackingToken('https://evil.com/track/short')).toBeNull();
  });

  it('custom portal domains resolve to their organization', () => {
    const domains = parsePortalDomains('support.abcinternet.co.ke=abc-internet, bad host=x, help.shop.co.ke=shop');
    expect(resolvePortalSlug('support.abcinternet.co.ke:443', domains)).toBe('abc-internet');
    expect(resolvePortalSlug('SUPPORT.ABCINTERNET.CO.KE', domains)).toBe('abc-internet');
    expect(resolvePortalSlug('app.example.com', domains)).toBeNull();
    expect(domains.size).toBe(2);
  });
});

// ---------------------------------------------------------------- audit
describe('audit descriptions', () => {
  const entry = (action: string, metadata: Record<string, unknown>): AuditEntry => ({ auditId: 1, tenantId: 't', actorId: 'a', actorName: 'Admin', actorRole: 'ADMIN', action, entityType: 'TICKET', entityId: '1', metadata, createdAt: '' });
  const names = new Map([['u1', 'Wanjiru'], ['u2', 'Otieno']]);

  it('resolves reassignment ids to member names', () => {
    expect(describeAction(entry('TICKET_ASSIGNED', { from: 'u1', to: 'u2' }), (id) => names.get(id))).toBe('reassigned the ticket from Wanjiru to Otieno');
    expect(describeAction(entry('TICKET_ASSIGNED', { from: null, to: 'u1' }), (id) => names.get(id))).toBe('assigned the ticket to Wanjiru');
    expect(describeAction(entry('COMMENT_ADDED', { visibility: 'INTERNAL' }))).toBe('added an internal note');
    expect(describeAction(entry('TICKET_STATUS_CHANGED', { from: 'WAITING_ON_CUSTOMER', to: 'IN_PROGRESS', reason: 'CUSTOMER_REPLY' }))).toMatch(/after a customer reply/);
  });
});
