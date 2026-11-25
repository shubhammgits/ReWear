"use client";

import { useFormStatus } from "react-dom";

/** A submit button that asks "are you sure?" first; for deletes and blocks */
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={`${className ?? ""} disabled:opacity-60`}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
