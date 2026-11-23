'use client';

import { useState, type ReactNode } from 'react';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button';

type ConfirmButtonProps = {
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** Two-step button for destructive or irreversible actions. */
export function ConfirmButton({ onConfirm, confirmLabel = 'Yes, confirm', variant = 'primary', size, loading, disabled, className, children }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button variant={variant} size={size} disabled={disabled} loading={loading} className={className} onClick={() => setArmed(true)}>
        {children}
      </Button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        variant={variant === 'danger' ? 'danger' : 'primary'}
        size={size}
        loading={loading}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </span>
  );
}
