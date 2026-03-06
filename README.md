# Creative Sales CRM

Supplier-first CRM and project management foundation for Creative Sales Solutions.

## Implemented foundation

- Next.js 14 App Router scaffold
- Drizzle schema for the approved supplier-first data model
- Replit-native Postgres foundation via `DATABASE_URL`
- Finance-ready schema extensions:
  - supplier finance metadata
  - expanded supplier contact roles
  - expanded activity types
  - `supplier_transactions`
  - `cashflow_entries`
- Postgres migration file for the initial schema
- Shared TypeScript domain types
- Activity type fallback label utility
- Basic landing page describing the implementation state

## Environment

Copy `.env.example` to `.env.local` and set at minimum:

- `DATABASE_URL`
- Microsoft Graph credentials for later auth and sync work

## Replit hosting

This project is now wired for Replit deployment with Replit-native Postgres.

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

- Finance schema additions are present but intentionally unused by CRM UI and routes at this stage.
- No finance-specific screens, jobs, or endpoints are included yet.
- The database layer is vendor-neutral Postgres and already compatible with Replit Postgres.
- Auth and file handling will be implemented without Supabase. The likely path is direct Microsoft OAuth plus app-managed sessions, with file uploads either stored in Replit-compatible object storage or handled as links first.
- The current codebase is the implementation foundation for the broader 8-week roadmap, not the full end-state product.
