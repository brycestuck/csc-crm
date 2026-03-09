import { DatabaseZap } from "lucide-react";

export function SetupState({ title, message }: { title: string; message: string }) {
  return (
    <main className="panel p-5">
      <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-zinc-700">
        <DatabaseZap size={18} />
      </div>
      <p className="section-kicker mt-4">Workspace status</p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{message}</p>
      <div className="subpanel mt-4 p-4 text-sm leading-6 text-zinc-500">
        In Replit, open the shell and run <code className="rounded bg-white px-2 py-1 font-mono text-zinc-900">npm run db:push</code>{" "}
        after setting your <code className="rounded bg-white px-2 py-1 font-mono text-zinc-900">DATABASE_URL</code> secret.
      </div>
    </main>
  );
}
