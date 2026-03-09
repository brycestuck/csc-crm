# The Hub

Operational supplier-first workspace for Creative Sales Solutions, built for Replit hosting with Replit Postgres.

## Current product slice

- Dashboard with live metrics from Postgres
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
- Microsoft Graph credentials for later auth and sync work

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
- Finance schema additions are present but intentionally unused by CRM UI and routes at this stage.
- No finance-specific screens, jobs, or endpoints are included yet.
- Auth is not implemented yet. The current operational slice assumes a shared internal workspace and uses a seeded admin user for record attribution.
- The next major build slices are Microsoft auth, inbox sync, calendar sync, spreadsheet imports, and leadership reporting.
