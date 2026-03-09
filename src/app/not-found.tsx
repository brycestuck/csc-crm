import Link from "next/link";

export default function NotFound() {
  return (
    <main className="hub-panel rounded-[32px] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
        Not found
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">That record does not exist.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        The supplier or page you opened is missing, archived, or the link was incomplete.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/suppliers"
          className="rounded-full bg-[var(--accent-deep)] px-4 py-3 text-sm font-medium text-white"
        >
          Back to suppliers
        </Link>
        <Link
          href="/"
          className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]"
        >
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
