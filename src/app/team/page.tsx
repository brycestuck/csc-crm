import Link from "next/link";
import { CreateUserForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { UserAvatar } from "@/components/crm/user-avatar";
import { getTeamPageData, getWorkspaceStatus } from "@/lib/db/crm";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getTeamPageData();

  return (
    <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="hub-panel rounded-[32px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
          Team
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">People and ownership</h1>
        <div className="mt-6 grid gap-4">
          {data.users.map((user) => (
            <Link
              key={user.id}
              href={`/team/${user.id}`}
              className="hub-subpanel rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent-strong)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    name={user.displayName}
                    color={user.avatarColor}
                    imagePath={user.avatarImagePath}
                    className="h-14 w-14 rounded-2xl"
                    textClassName="text-lg"
                    sizes="56px"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--ink)]">{user.displayName}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {user.jobTitle || "No title yet"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {user.department || "No department yet"} · {user.role}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{user.email}</p>
                    {user.teamPartner ? (
                      <p className="mt-2 text-sm text-[var(--accent-deep)]">Partner: {user.teamPartner}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                  <span className="rounded-full bg-white px-3 py-2">{user.supplierCount} suppliers</span>
                  <span className="rounded-full bg-white px-3 py-2">{user.accountCount} accounts</span>
                  <span className="rounded-full bg-white px-3 py-2">{user.activeProjectCount} projects</span>
                  <span className="rounded-full bg-white px-3 py-2">{user.openTaskCount} open tasks</span>
                </div>
              </div>
              {user.bio ? (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">{user.bio}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <aside>
        <CreateUserForm />
      </aside>
    </main>
  );
}
