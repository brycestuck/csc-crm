import { AssignTaskOwnerForm, CreateTaskForm, TaskStatusForm } from "@/components/crm/forms";
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
    <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="hub-panel rounded-[32px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
          Tasks
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Execution queue</h1>
        <div className="mt-6 grid gap-4">
          {data.tasks.map((task) => (
            <article
              key={task.id}
              className="hub-subpanel flex flex-wrap items-center justify-between gap-4 rounded-[24px] p-5"
            >
              <div>
                <h2 className="text-lg font-semibold text-[var(--ink)]">{task.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {task.supplierName || "No supplier"} · {task.projectName || "No project"} · Due{" "}
                  {formatDate(task.dueDate)} ({formatRelativeDaysFromNow(task.dueDate)})
                </p>
                <div className="mt-2 text-sm text-[var(--muted)]">
                  Owner: {task.ownerName || "Unassigned"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white px-3 py-2 text-sm text-[var(--muted)]">
                  {task.priority}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-sm text-[var(--muted)]">
                  {task.status}
                </span>
                <AssignTaskOwnerForm
                  entityId={task.id}
                  ownerUserId={task.ownerUserId}
                  returnTo="/tasks"
                  users={data.users}
                />
                <TaskStatusForm taskId={task.id} returnTo="/tasks" currentStatus={task.status} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="grid gap-6">
        <CreateTaskForm
          supplierOptions={data.suppliers}
          projects={data.projects}
          users={data.users}
          returnTo="/tasks"
        />

        <section className="hub-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Queue summary
          </p>
          <div className="mt-5 grid gap-3">
            <div className="hub-subpanel rounded-[20px] p-4">
              <div className="text-sm text-[var(--muted)]">Open tasks</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{data.metrics.openCount}</div>
            </div>
            <div className="hub-subpanel rounded-[20px] p-4">
              <div className="text-sm text-[var(--muted)]">Overdue</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{data.metrics.overdueCount}</div>
            </div>
            <div className="hub-subpanel rounded-[20px] p-4">
              <div className="text-sm text-[var(--muted)]">Completed</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{data.metrics.doneCount}</div>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}
