'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { buttonClass, type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cx } from '@/lib/utils';

type FileButtonProps = {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function FileButton({ onFiles, accept, multiple, disabled, loading, variant = 'outline', size = 'md', children }: FileButtonProps) {
  const off = disabled || loading;

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // lets the user pick the same file again
    if (files.length > 0) onFiles(files);
  }

  return (
    <label className={cx(buttonClass(variant, size), 'cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary', off && 'pointer-events-none opacity-60')}>
      {loading && <Spinner />}
      {children}
      <input type="file" className="sr-only" accept={accept} multiple={multiple} disabled={off} onChange={onChange} />
    </label>
  );
}
