import { describe, expect, it } from 'vitest';
import { buildContactMailto, whatsappLink } from '@/lib/contact';
import { FOOTER_COLUMNS, INDUSTRIES, MAIN_NAV } from '@/lib/constants/site';

describe('contact form mailto', () => {
  it('encodes recipient, subject and body', () => {
    const url = buildContactMailto('hello@example.com', { name: ' Amina ', email: 'amina@shop.ke', business: 'ABC Store', topic: 'Assisted setup', message: 'Hi & thanks\nLine 2' });
    expect(url.startsWith('mailto:hello%40example.com?subject=')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('Assisted setup: ABC Store');
    expect(params.get('body')).toBe('Hi & thanks\nLine 2\n\n—\nName: Amina\nEmail: amina@shop.ke\nBusiness: ABC Store');
  });

  it('falls back to the sender name and omits an empty business', () => {
    const url = buildContactMailto('a@b.co', { name: 'Peter', email: 'p@x.co', business: '  ', topic: 'General question', message: 'Hello' });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('General question: Peter');
    expect(params.get('body')).not.toContain('Business:');
  });

  it('builds WhatsApp links from any number format', () => {
    expect(whatsappLink('+254 712 345 678')).toBe('https://wa.me/254712345678');
    expect(whatsappLink('254712345678', 'Hi there')).toBe('https://wa.me/254712345678?text=Hi%20there');
  });
});

describe('site navigation', () => {
  it('links every industry in the footer to an anchor on the features page', () => {
    const industries = FOOTER_COLUMNS.find((c) => c.title === 'Industries')!;
    expect(industries.links.map((l) => l.href)).toEqual(INDUSTRIES.map((i) => `/features#${i.id}`));
  });

  it('exposes the four marketing pages in the main navigation', () => {
    expect(MAIN_NAV.map((n) => n.href)).toEqual(['/features', '/how-it-works', '/pricing', '/contact']);
  });
});
