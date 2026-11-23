'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/select-field';
import { TextAreaField } from '@/components/ui/textarea-field';
import { buildContactMailto, type ContactMessage } from '@/lib/contact';

const TOPICS = ['General question', 'Assisted setup', 'Custom portal domain', 'Partnership', 'Something else'];

/** Composes an email in the visitor's mail app; nothing is sent to our servers. */
export function ContactForm({ to }: { to: string }) {
  const [m, setM] = useState<ContactMessage>({ name: '', email: '', business: '', topic: TOPICS[0], message: '' });
  const [opened, setOpened] = useState(false);
  const set = (k: keyof ContactMessage) => (e: { target: { value: string } }) => setM((prev) => ({ ...prev, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    window.location.href = buildContactMailto(to, m);
    setOpened(true);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" autoComplete="name" required value={m.name} onChange={set('name')} />
        <Field label="Email" name="email" type="email" autoComplete="email" required value={m.email} onChange={set('email')} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business name" name="business" autoComplete="organization" value={m.business} onChange={set('business')} hint="Optional" />
        <SelectField label="Topic" name="topic" value={m.topic} onChange={set('topic')}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </SelectField>
      </div>
      <TextAreaField label="How can we help?" name="message" rows={5} required value={m.message} onChange={set('message')} />
      <Button type="submit" size="lg" className="w-full font-semibold sm:w-auto">
        Send message <Icon name="arrowRight" className="h-4 w-4" />
      </Button>
      <p className="text-xs text-muted" role={opened ? 'status' : undefined}>
        {opened
          ? `Your email app should have opened with the message ready to send. If it did not, write to ${to} directly.`
          : 'This opens your email app with your message filled in.'}
      </p>
    </form>
  );
}
