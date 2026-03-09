import Link from "next/link";

export default function NotFound() {
  return (
    <main className="panel p-5">
      <p className="section-kicker">Not found</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-950">That record does not exist.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
        The supplier or page you opened is missing, archived, or the link was incomplete.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/suppliers" className="btn-primary">
          Back to suppliers
        </Link>
        <Link href="/" className="btn-secondary">
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
