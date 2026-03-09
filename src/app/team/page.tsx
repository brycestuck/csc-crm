import Link from "next/link";
import { deleteUserAction } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/crm/confirm-submit-button";
import { FormDrawer } from "@/components/crm/form-drawer";
import { CreateUserForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { UserAvatar } from "@/components/crm/user-avatar";
import { getCurrentUser } from "@/lib/auth/session";
import { getTeamPageData, getWorkspaceStatus } from "@/lib/db/crm";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  searchParams?: {
    name?: string | string[];
    role?: string | string[];
  };
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildReturnTo(nameFilter: string, roleFilter: string) {
  const params = new URLSearchParams();

  if (nameFilter) {
    params.set("name", nameFilter);
  }

  if (roleFilter && roleFilter !== "all") {
    params.set("role", roleFilter);
  }

  const query = params.toString();
  return query ? `/team?${query}` : "/team";
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const currentUser = await getCurrentUser();
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getTeamPageData();
  const rawNameFilter = readSearchParam(searchParams?.name).trim();
  const nameFilter = rawNameFilter.toLowerCase();
  const rawRoleFilter = readSearchParam(searchParams?.role).trim().toLowerCase();
  const roleFilter = rawRoleFilter === "admin" || rawRoleFilter === "member" ? rawRoleFilter : "all";
  const isAdmin = currentUser?.role === "admin";
  const adminCount = data.users.filter((user) => user.role === "admin").length;
  const returnTo = buildReturnTo(rawNameFilter, roleFilter);

  const filteredUsers = data.users.filter((user) => {
    const matchesName =
      !nameFilter ||
      user.displayName.toLowerCase().includes(nameFilter) ||
      user.email.toLowerCase().includes(nameFilter);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesName && matchesRole;
  });

  const totals = filteredUsers.reduce(
    (acc, user) => ({
      suppliers: acc.suppliers + user.supplierCount,
      accounts: acc.accounts + user.accountCount,
      projects: acc.projects + user.activeProjectCount,
      tasks: acc.tasks + user.openTaskCount,
    }),
    { suppliers: 0, accounts: 0, projects: 0, tasks: 0 }
  );

  return (
    <main className="grid gap-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="section-kicker">Team</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">People and ownership</h1>
          </div>
          {isAdmin ? (
            <FormDrawer
              triggerLabel="Add Team Member"
              title="Add team member"
              description="Create a profile so the person can sign in and own work."
            >
              <CreateUserForm embedded />
            </FormDrawer>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto_auto]">
            <label className="grid gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Name
              <input
                type="search"
                name="name"
                defaultValue={rawNameFilter}
                placeholder="Search people"
                className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Role
              <select
                name="role"
                defaultValue={roleFilter}
                className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400"
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Apply
            </button>

            <Link
              href="/team"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Clear
            </Link>
          </form>

          <div className="flex flex-wrap gap-2">
            <span className="pill font-mono">{filteredUsers.length} shown</span>
            <span className="pill font-mono">{totals.accounts} accounts</span>
            <span className="pill font-mono">{totals.projects} active projects</span>
            <span className="pill font-mono">{totals.tasks} open tasks</span>
          </div>
        </div>
      </section>

      {filteredUsers.length > 0 ? (
        <section className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredUsers.map((user) => {
            const canDelete =
              isAdmin &&
              user.id !== currentUser?.id &&
              !(user.role === "admin" && adminCount <= 1);

            return (
              <article key={user.id} className="panel p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <UserAvatar
                      name={user.displayName}
                      color={user.avatarColor}
                      imagePath={user.avatarImagePath}
                      className="h-14 w-14 rounded-xl"
                      textClassName="text-base"
                      sizes="56px"
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/team/${user.id}`}
                          className="truncate text-sm font-semibold text-zinc-950 transition hover:text-zinc-700"
                        >
                          {user.displayName}
                        </Link>
                        <span className="pill">{user.role}</span>
                      </div>

                      <p className="mt-1 truncate text-sm text-zinc-700">{user.jobTitle || "No title set"}</p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                        <span>{user.department || "No department"}</span>
                        {user.teamPartner ? <span>Partner: {user.teamPartner}</span> : null}
                      </div>

                      <p className="mt-1 truncate text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/team/${user.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      Open
                    </Link>

                    {canDelete ? (
                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <ConfirmSubmitButton
                          label="Delete"
                          confirmMessage={`Delete ${user.displayName}? This will deactivate the profile and clear active ownership assignments.`}
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        />
                      </form>
                    ) : null}
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 text-xs sm:grid-cols-4">
                  <div className="flex min-h-[64px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Suppliers</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{user.supplierCount}</dd>
                  </div>
                  <div className="flex min-h-[64px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Accounts</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{user.accountCount}</dd>
                  </div>
                  <div className="flex min-h-[64px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Projects</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{user.activeProjectCount}</dd>
                  </div>
                  <div className="flex min-h-[64px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Open tasks</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{user.openTaskCount}</dd>
                  </div>
                </dl>

                {user.bio ? <p className="mt-3 text-xs leading-5 text-zinc-500">{user.bio}</p> : null}
              </article>
            );
          })}
        </section>
      ) : (
        <section className="panel p-5">
          <p className="section-kicker">No Matches</p>
          <p className="mt-2 text-sm text-zinc-600">No team members match the current filters.</p>
        </section>
      )}
    </main>
  );
}
