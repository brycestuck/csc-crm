import { CreateProjectForm, ProjectStageForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getProjectsPageData, getWorkspaceStatus } from "@/lib/db/crm";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getProjectsPageData();

  return (
    <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="hub-panel rounded-[32px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
          Projects
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Pipeline and workstreams</h1>
        <div className="mt-6 grid gap-4">
          {data.projects.map((project) => (
            <article key={project.id} className="hub-subpanel rounded-[24px] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--ink)]">{project.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {project.supplierName} · {project.retailerName}
                    {project.buyerName ? ` · ${project.buyerName}` : ""}
                  </p>
                  {project.summary ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{project.summary}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                  <span className="rounded-full bg-white px-3 py-2">Priority: {project.priority}</span>
                  <span className="rounded-full bg-white px-3 py-2">Status: {project.status}</span>
                  <span
                    className="rounded-full px-3 py-2"
                    style={{
                      backgroundColor: `${project.stageColor || "#ddd"}22`,
                      color: project.stageColor || "var(--ink)",
                    }}
                  >
                    {project.stageName || "No stage"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <ProjectStageForm
                  projectId={project.id}
                  returnTo="/projects"
                  stages={data.stages}
                  currentStageId={project.stageId}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="grid gap-6">
        <CreateProjectForm
          supplierOptions={data.suppliers}
          retailers={data.retailers}
          stages={data.stages}
          returnTo="/projects"
        />

        <section className="hub-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Stage summary
          </p>
          <div className="mt-5 grid gap-3">
            {data.stageSummary.map((stage) => (
              <div
                key={stage.id}
                className="hub-subpanel flex items-center justify-between rounded-[20px] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: stage.color || "var(--accent-strong)" }}
                  />
                  <span className="text-sm font-medium text-[var(--ink)]">{stage.name}</span>
                </div>
                <span className="text-sm text-[var(--muted)]">{stage.count}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
