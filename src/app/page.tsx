import { CalendarDays, Database, Mail, ShieldCheck } from "lucide-react";
import { pipelineStageSeeds, supplierTransactionTypes } from "@/lib/types/domain";

const foundationCards = [
  {
    title: "Supplier-first schema",
    body: "Suppliers, retailer departments, buyers, projects, tasks, activities, and documents are modeled directly in Drizzle.",
    icon: Database,
  },
  {
    title: "Microsoft-ready",
    body: "The foundation includes typed tables for inbox sync, calendar sync, and per-user Microsoft connections.",
    icon: Mail,
  },
  {
    title: "Finance-ready stubs",
    body: "Supplier finance metadata, supplier transactions, and cashflow entries are present without expanding CRM scope.",
    icon: ShieldCheck,
  },
  {
    title: "Walmart calendar support",
    body: "A dedicated fiscal reference table is included so imports and downstream scheduling can key off Walmart week logic.",
    icon: CalendarDays,
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6 rounded-[32px] border border-white/50 bg-white/75 p-8 shadow-[0_30px_120px_rgba(53,41,28,0.12)] backdrop-blur">
            <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Creative Sales CRM
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                Supplier-first CRM foundation with finance-ready schema extensions already in place.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                This implementation establishes the shared data model, Drizzle schema, SQL migration,
                typed activity handling, and project scaffold for the Creative Sales Solutions build.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-[var(--surface)] px-4 py-2">Next.js 14</span>
              <span className="rounded-full bg-[var(--surface)] px-4 py-2">Supabase-ready</span>
              <span className="rounded-full bg-[var(--surface)] px-4 py-2">Drizzle ORM</span>
              <span className="rounded-full bg-[var(--surface)] px-4 py-2">Microsoft-first</span>
            </div>
          </div>

          <aside className="grid gap-4 rounded-[32px] border border-[var(--line)] bg-[var(--ink)] p-6 text-[var(--paper)] shadow-[0_24px_80px_rgba(24,20,16,0.32)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                Current implementation
              </p>
              <p className="mt-4 text-3xl font-semibold">23 tables</p>
            </div>
            <div className="grid gap-3 text-sm text-white/74">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                12 pipeline stages seeded in shared domain constants
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {supplierTransactionTypes.length} supplier transaction types reserved for future finance workflows
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Timeline rendering now supports known and unknown activity types safely
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {foundationCards.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[28px] border border-[var(--line)] bg-white/70 p-6 shadow-[0_18px_60px_rgba(53,41,28,0.08)] backdrop-blur"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
                <Icon size={20} />
              </div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[32px] border border-[var(--line)] bg-[var(--surface-strong)] p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Seeded stages
            </p>
            <div className="mt-5 grid gap-3">
              {pipelineStageSeeds.map((stage) => (
                <div
                  key={stage.name}
                  className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium text-[var(--ink)]">{stage.name}</span>
                  </div>
                  <span className="text-sm text-[var(--muted)]">#{stage.displayOrder}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--line)] bg-white/75 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Foundation notes
            </p>
            <div className="mt-5 grid gap-4 text-sm leading-7 text-[var(--muted)]">
              <p>
                The codebase now includes the full supplier-first relational model from the approved
                architecture, including finance-ready schema stubs that do not alter current CRM scope.
              </p>
              <p>
                The next implementation slices are application behavior: auth flows, CRUD routes, imports,
                inbox sync, and the execution dashboard.
              </p>
              <p>
                The current priority was establishing a clean database contract first so future build work
                does not need to retrofit core entities later.
              </p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
