/**
 * Marketing-site configuration: hero image, contact details, navigation, plans.
 * Edit this file (or the env vars it reads) to change the public pages without touching their layout.
 */

/**
 * Hero image. Defaults to the bundled /public/images/hero-support.jpg (736×736, white background).
 * Set NEXT_PUBLIC_HERO_IMAGE_URL to use an online image instead (e.g. an Unsplash URL); its host is
 * allowed automatically in next.config.ts. The image is shown square with object-contain, so any size works.
 */
export const HERO_IMAGE = {
  src: process.env.NEXT_PUBLIC_HERO_IMAGE_URL || '/images/hero-support.jpg',
  alt: 'A support headset above an open hand, surrounded by customer messages, ratings and a satisfaction score',
};

/** Public contact details. Anything left empty is simply not shown. */
export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '',
  /** International format without "+" or spaces, e.g. 254712345678. */
  whatsapp: (process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? '').replace(/\D/g, ''),
  location: process.env.NEXT_PUBLIC_CONTACT_LOCATION ?? 'Nairobi, Kenya',
  hours: 'Monday to Friday, 8:00 to 18:00 EAT',
};

export const MAIN_NAV = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export const INDUSTRIES = [
  { id: 'retail', title: 'Retail & e-commerce', text: 'Late deliveries, wrong sizes, returns and refunds, each tied to an order reference.' },
  { id: 'food', title: 'Restaurants & delivery', text: 'Missing items and late riders handled while the customer is still waiting.' },
  { id: 'internet', title: 'Internet & utilities', text: 'Outages and billing disputes with a branded portal customers can check themselves.' },
  { id: 'health', title: 'Clinics & pharmacies', text: 'Appointment and prescription follow-ups with notes kept strictly internal.' },
  { id: 'education', title: 'Schools & colleges', text: 'Fee queries and parent requests routed to the right office and closed out.' },
  { id: 'property', title: 'Property & real estate', text: 'Maintenance requests from tenants, assigned to caretakers and tracked to done.' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/features#capture', label: 'Shared ticket queue' },
      { href: '/features#inform', label: 'Customer tracking links' },
      { href: '/features#inform', label: 'Branded support portal' },
      { href: '/features#control', label: 'Roles & audit log' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  { title: 'Industries', links: INDUSTRIES.map((i) => ({ href: `/features#${i.id}`, label: i.title })) },
  {
    title: 'Company',
    links: [
      { href: '/contact', label: 'Contact us' },
      { href: '/pricing#faq', label: 'FAQ' },
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Create an account' },
    ],
  },
];

/**
 * Plans shown on /pricing. No billing exists in the product yet, so the defaults describe what is true today:
 * free use of everything, plus optional assisted onboarding. Replace them when paid plans launch.
 */
export const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'during early access',
    description: 'Everything your team needs to record, assign and resolve customer issues.',
    cta: { href: '/register', label: 'Create your free account' },
    featured: true,
    features: [
      'Unlimited tickets and contacts',
      'Invite your whole team',
      'Admin and agent roles',
      'Customer tracking links',
      'Branded support portal',
      'Internal notes and attachments',
      'Audit log',
    ],
  },
  {
    name: 'Assisted setup',
    price: 'Custom',
    period: 'one-off',
    description: 'For businesses that want help getting started or need their portal on their own domain.',
    cta: { href: '/contact', label: 'Talk to us' },
    featured: false,
    features: ['Everything in Starter', 'Import of existing customer contacts', 'Support portal on your own domain', 'Team onboarding session', 'Priority email support'],
  },
];

export const FAQ = [
  {
    q: 'Do my customers need to create an account?',
    a: 'No. Customers receive a private tracking link. They can see the status of their request, read your replies and respond, without signing up or installing anything.',
  },
  {
    q: 'Can customers see our internal notes?',
    a: 'Never. Internal notes and internal attachments are only visible to your team. Customers only see replies you mark as public.',
  },
  {
    q: 'Does it connect directly to WhatsApp, Instagram or TikTok?',
    a: 'Not yet. Your team keeps chatting on those channels as usual and records each issue as a ticket with the channel noted, then shares the tracking link back to the customer.',
  },
  {
    q: 'Can I manage more than one business?',
    a: 'Yes. One account can belong to several organizations and switch between them. Each organization has its own team, tickets, contacts and portal.',
  },
  {
    q: 'Can a tracking link be cancelled?',
    a: 'Yes. Links expire, and an admin can revoke a link at any time, which immediately stops it from working.',
  },
  {
    q: 'Is there a limit on team members or tickets?',
    a: 'Not during early access. Invite your whole team and record as many tickets as you need.',
  },
];
