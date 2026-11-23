'use client';

import { useState } from 'react';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button';

type CopyButtonProps = { value: string; label?: string; variant?: ButtonVariant; size?: ButtonSize };

export function CopyButton({ value, label = 'Copy', variant = 'outline', size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the value is still on screen */
    }
  }

  return (
    <Button variant={variant} size={size} onClick={copy} aria-live="polite">
      {copied ? 'Copied' : label}
    </Button>
  );
}
