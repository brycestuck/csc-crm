import { DatabaseZap } from "lucide-react";

export function SetupState({ title, message }: { title: string; message: string }) {
  return (
    <main className="hub-panel rounded-[32px] p-8">
      <div className="inline-flex rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent-deep)]">
        <DatabaseZap size={22} />
      </div>
      <h2 className="mt-5 text-3xl font-semibold text-[var(--ink)]">{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{message}</p>
      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--muted)]">
        In Replit, open the shell and run <code className="rounded bg-white px-2 py-1">npm run db:push</code>{" "}
        after setting your <code className="rounded bg-white px-2 py-1">DATABASE_URL</code> secret.
      </div>
    </main>
  );
}
