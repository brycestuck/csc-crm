import Link from "next/link";

export default function NotFound() {
  return (
    <main className="rounded-[32px] border border-[var(--line)] bg-white/80 p-8 shadow-[0_24px_80px_rgba(53,41,28,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
        Not found
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">That record does not exist.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        The supplier or page you opened is missing, archived, or the link was incomplete.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/suppliers" className="rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-medium text-white">
          Back to suppliers
        </Link>
        <Link href="/" className="rounded-full bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--ink)]">
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
