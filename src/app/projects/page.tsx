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
    <main className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel p-4">
        <div className="border-b border-zinc-200 pb-3">
          <p className="section-kicker">Projects</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Pipeline and workstreams</h1>
        </div>
        <div className="mt-4 grid gap-3">
          {data.projects.map((project) => (
            <article key={project.id} className="subpanel p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-zinc-950">{project.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {project.supplierName} · {project.retailerName}
                    {project.buyerName ? ` · ${project.buyerName}` : ""}
                  </p>
                  {project.summary ? <p className="mt-2 text-sm leading-6 text-zinc-500">{project.summary}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="pill">{project.ownerName || "Unassigned"}</span>
                  <span className="pill font-mono">{project.priority}</span>
                  <span className="pill font-mono">{project.status}</span>
                  <span
                    className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: `${project.stageColor || "#d4d4d8"}22`, color: project.stageColor || "#18181b" }}
                  >
                    {project.stageName || "No stage"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
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

      <aside className="grid gap-4">
        <CreateProjectForm
          supplierOptions={data.suppliers}
          retailers={data.retailers}
          stages={data.stages}
          returnTo="/projects"
        />

        <section className="panel p-4">
          <p className="section-kicker">Stage summary</p>
          <div className="mt-4 grid gap-2">
            {data.stageSummary.map((stage) => (
              <div key={stage.id} className="subpanel flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color || "#18181b" }} />
                  <span className="text-sm font-medium text-zinc-900">{stage.name}</span>
                </div>
                <span className="font-mono text-sm text-zinc-500">{stage.count}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
