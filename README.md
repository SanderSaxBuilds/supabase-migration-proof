# Supabase migration proof

An independent portfolio proof for moving an existing application's data model to Supabase. It uses synthetic records and does not claim access to a real Base44 project or client system.

The package shows a careful migration path:

- inventory and map source records before touching production
- transform and validate a synthetic export deterministically
- create relational Postgres tables with constraints and indexes
- enable row-level security for user-owned records
- rehearse import, reconciliation, cutover and rollback
- document authentication limits instead of promising password portability

## Run it

Node.js 20 or newer is recommended. There are no dependencies to install.

```bash
npm run verify
```

`verify` runs the transform, then the tests. Without npm, the same two steps are:

```bash
node scripts/transform-export.mjs source/base44-export.sample.json build
node --test tests/*.test.mjs
```

The transform writes normalized `users.json`, `projects.json`, `tasks.json` and a `reconciliation.json` count report under `build/`. The tests check record counts, status normalization, null handling for optional dates, and rejection of missing owners, missing projects, duplicate identifiers, malformed emails and malformed dates.

## Repository map

- `source/base44-export.sample.json` holds the synthetic source records
- `scripts/transform-export.mjs` validates and normalizes the export
- `supabase/migrations/001_schema.sql` creates the target schema, indexes, triggers and RLS policies
- `tests/transform.test.mjs` checks successful and rejected migrations
- `docs/migration-runbook.md` covers discovery, rehearsal, cutover, rollback and support
- `docs/acceptance-checklist.md` lists the evidence needed before a production cutover
## Boundaries

Base44 project schemas and export routes vary. A real engagement starts with a read-only inventory of the supplied project, its export format, authentication provider, storage, server functions, environment variables and integrations. This proof is an adapter pattern, not a universal Base44 exporter.

Authentication needs special handling. Password hashes cannot be assumed portable. The production plan chooses a supported transfer method, a staged password reset or an account linking flow after inspecting the source identity system and Supabase requirements.

No client data belongs in this repository. Production secrets stay in the client's environment and never enter source control.
