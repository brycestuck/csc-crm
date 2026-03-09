import Link from "next/link";

export function SignInScreen({
  authError,
  microsoftConfigured,
  localAdminConfigured,
}: {
  authError?: string | null;
  microsoftConfigured: boolean;
  localAdminConfigured: boolean;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-5 lg:p-6">
          <p className="section-kicker">Creative Sales Consulting</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] text-zinc-950">
            THE HUB
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Sign in with your CSC Microsoft account to access supplier workspaces, projects, tasks,
            and leadership controls.
          </p>

          {authError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {microsoftConfigured ? (
              <Link href="/api/auth/login" className="btn-primary">
                Sign in with Microsoft
              </Link>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Microsoft OAuth is not configured yet. Add the Microsoft secrets in Replit before
                using live login.
              </div>
            )}
          </div>

          {localAdminConfigured ? (
            <div className="mt-6 border-t border-zinc-200 pt-5">
              <div className="section-kicker">Temporary local admin</div>
              <div className="mt-2 text-sm leading-6 text-zinc-500">
                Use the env-backed super-admin credentials configured for this environment.
              </div>
              <form action="/api/auth/local" method="post" className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  name="email"
                  type="email"
                  placeholder="Admin email"
                  required
                  className="input-control"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="input-control"
                />
                <div className="sm:col-span-2">
                  <button className="btn-secondary">Sign in as local admin</button>
                </div>
              </form>
            </div>
          ) : null}
        </section>

        <section className="panel grid gap-4 p-5 lg:p-6">
          <div>
            <p className="section-kicker">Access model</p>
            <div className="mt-2 text-sm leading-6 text-zinc-500">
              Known CSC users only. Unknown Microsoft accounts are denied. Leadership controls are
              admin-only.
            </div>
          </div>
          <div className="grid gap-3">
            <div className="subpanel p-4">
              <div className="section-kicker">Members</div>
              <div className="mt-2 text-sm text-zinc-700">Tasks, projects, activities, contacts.</div>
            </div>
            <div className="subpanel p-4">
              <div className="section-kicker">Admins</div>
              <div className="mt-2 text-sm text-zinc-700">
                Leadership command center, ownership reassignment, team provisioning.
              </div>
            </div>
            <div className="subpanel p-4">
              <div className="section-kicker">Temporary access</div>
              <div className="mt-2 text-sm text-zinc-700">
                Optional local-admin credentials can be enabled for implementation work before CSC
                Microsoft provisioning is complete.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
