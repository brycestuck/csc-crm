import { CreateTaskForm, TaskStatusForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getTasksPageData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate, formatRelativeDaysFromNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getTasksPageData();

  return (
    <main className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel p-4">
        <div className="border-b border-zinc-200 pb-3">
          <p className="section-kicker">Tasks</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Execution queue</h1>
        </div>
        <div className="mt-4 grid gap-3">
          {data.tasks.map((task) => (
            <article key={task.id} className="subpanel p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-950">{task.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {task.supplierName || "No supplier"} · {task.projectName || "No project"} · Due {formatDate(task.dueDate)} ({formatRelativeDaysFromNow(task.dueDate)})
                  </p>
                  <div className="mt-2 text-sm text-zinc-500">Owner: {task.ownerName || "Unassigned"}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill font-mono">{task.priority}</span>
                  <span className="pill font-mono">{task.status}</span>
                  <TaskStatusForm taskId={task.id} returnTo="/tasks" currentStatus={task.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="grid gap-4">
        <CreateTaskForm supplierOptions={data.suppliers} projects={data.projects} returnTo="/tasks" />

        <section className="panel p-4">
          <p className="section-kicker">Queue summary</p>
          <div className="mt-4 grid gap-3">
            <div className="subpanel p-4">
              <div className="section-kicker">Open tasks</div>
              <div className="metric-value mt-2">{data.metrics.openCount}</div>
            </div>
            <div className="subpanel p-4">
              <div className="section-kicker">Overdue</div>
              <div className="metric-value mt-2">{data.metrics.overdueCount}</div>
            </div>
            <div className="subpanel p-4">
              <div className="section-kicker">Completed</div>
              <div className="metric-value mt-2">{data.metrics.doneCount}</div>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}
