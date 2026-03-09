import Link from "next/link";
import { FormDrawer } from "@/components/crm/form-drawer";
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
    <main className="grid gap-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <p className="section-kicker">Team</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">People and ownership</h1>
          </div>
          <FormDrawer
            triggerLabel="Add Team Member"
            title="Add team member"
            description="Create a profile so the person can own suppliers, accounts, projects, and tasks."
          >
            <CreateUserForm embedded />
          </FormDrawer>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {data.users.map((user) => (
          <Link key={user.id} href={`/team/${user.id}`} className="panel p-4 transition hover:border-zinc-300 hover:bg-zinc-50">
            <div className="flex items-start gap-4">
              <UserAvatar
                name={user.displayName}
                color={user.avatarColor}
                imagePath={user.avatarImagePath}
                className="h-14 w-14"
                textClassName="text-base"
                sizes="56px"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-zinc-950">{user.displayName}</h2>
                  <span className="pill">{user.role}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{user.jobTitle || "No title yet"}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {user.department || "No department yet"}
                </p>
                <p className="mt-2 text-sm text-zinc-500">{user.email}</p>
                {user.teamPartner ? <p className="mt-2 text-sm text-zinc-700">Partner: {user.teamPartner}</p> : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="pill font-mono">{user.supplierCount} suppliers</span>
              <span className="pill font-mono">{user.accountCount} accounts</span>
              <span className="pill font-mono">{user.activeProjectCount} projects</span>
              <span className="pill font-mono">{user.openTaskCount} open tasks</span>
            </div>

            {user.bio ? <p className="mt-3 text-sm leading-6 text-zinc-500">{user.bio}</p> : null}
          </Link>
        ))}
      </section>
    </main>
  );
}
