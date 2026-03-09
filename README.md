# The Hub

Operational supplier-first workspace for Creative Sales Solutions, built for Replit hosting with Replit Postgres.

## Current product slice

- Dashboard with live metrics from Postgres
- Microsoft sign-in with CSC roster enforcement
- Persistent signed-in identity block in the shell
- Admin-only `Leadership` command center for reassignment and ownership oversight
- Team page with user profiles and ownership views
- Supplier workspace with:
  - supplier records
  - supplier contacts
  - supplier-specific projects
  - tasks
  - activity timeline
- Global projects page with stage management
- Global tasks page with task creation and completion
- Global activity page with timeline logging
- Automatic workspace seeding for a brand-new database so the app is usable immediately
- Finance-ready schema extensions:
  - supplier finance metadata
  - expanded supplier contact roles
  - expanded activity types
  - `supplier_transactions`
  - `cashflow_entries`

## Environment

Copy `.env.example` to `.env.local` and set at minimum:

- `DATABASE_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_REDIRECT_URI`
- `SESSION_SECRET`
- `LOCAL_ADMIN_EMAIL` and `LOCAL_ADMIN_PASSWORD` if you need temporary non-Microsoft access during setup

## Replit hosting

This project is wired for Replit deployment with Replit-native Postgres.

- `.replit` runs the app on port `3000` and maps it to external port `80`
- `replit.nix` provides Node 20 + npm
- `npm run dev` and `npm run start` bind to `0.0.0.0` and respect Replit's `PORT`
- Drizzle uses the Replit Postgres connection string from `DATABASE_URL`

Add these as Replit Secrets:

- `DATABASE_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_REDIRECT_URI`
- `GRAPH_DIGEST_SENDER`
- `SESSION_SECRET`
- `LOCAL_ADMIN_EMAIL`
- `LOCAL_ADMIN_PASSWORD`
- `LOCAL_ADMIN_NAME` (optional)

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run db:generate
npm run db:push
```

## Notes

- The first launch into an empty database seeds pipeline stages, core retailers, a default admin user, sample suppliers, sample projects, sample tasks, sample activities, sample buyers, and supplier contacts.
- After pulling schema changes, run `npm run db:push` again so new columns like team profile fields are applied to Replit Postgres.
- Microsoft login now gates the app. Users must exist in the seeded/team roster and sign in with that exact CSC Microsoft account.
- If CSC Microsoft provisioning is delayed, you can enable a temporary env-backed local super-admin login with `LOCAL_ADMIN_EMAIL` and `LOCAL_ADMIN_PASSWORD`.
- The local admin path is intended as a temporary implementation bypass and should be removed or disabled once CSC Microsoft auth is live.
- Set `MICROSOFT_REDIRECT_URI` to the live Replit callback URL, for example `https://your-repl-domain/api/auth/callback`.
- Leadership reassignment now lives at `/leadership` and is only visible to `admin` users.
- Finance schema additions are present but intentionally unused by CRM UI and routes at this stage.
- No finance-specific screens, jobs, or endpoints are included yet.
- The next major build slices are inbox sync, calendar sync, spreadsheet imports, and leadership reporting refinements.
