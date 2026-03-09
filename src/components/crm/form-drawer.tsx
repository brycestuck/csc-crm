"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type FormDrawerProps = {
  triggerLabel: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function FormDrawer({ triggerLabel, title, description, children }: FormDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/30 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-zinc-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <p className="section-kicker">Create</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-950">{title}</h2>
                {description ? <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
              >
                <X size={16} />
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
