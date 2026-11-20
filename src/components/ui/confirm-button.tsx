"use client";

import { useState, type ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";

type ConfirmButtonProps = {
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

export function ConfirmButton({
  onConfirm,
  confirmLabel = "Yes, confirm",
  variant = "primary",
  loading,
  disabled,
  className,
  children,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button variant={variant} disabled={disabled} className={className} onClick={() => setArmed(true)}>
        {children}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        loading={loading}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </div>
  );
}