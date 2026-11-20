"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
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
    <Button variant="secondary" onClick={copy}>
      {copied ? "Copied" : label}
    </Button>
  );
}