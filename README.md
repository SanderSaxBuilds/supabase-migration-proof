# Supabase migration proof

This is an independent portfolio proof for migrating an existing application data model to Supabase. It uses synthetic records and does not claim access to a real Base44 project or client system.

The package demonstrates a cautious migration path:

- inventory and map source records before changing production
- transform and validate synthetic export data deterministically
- create relational Postgres tables with constraints and indexes
- enable row-level security for user-owned records
- rehearse import, reconciliation, cutover, and rollback
- document authentication limits instead of promising password portability

## Run it

Node.js 20 or newer is recommended.

```bash
npm run verify
```

The transform writes normalized JSON files and a reconciliation report under `build/`. Tests verify record counts, foreign keys, status normalization, timestamps, and rejection of malformed input.

## Repository map

- `source/base44-export.sample.json` contains synthetic source records
- `scripts/transform-export.mjs` validates and normalizes the export
- `supabase/migrations/001_schema.sql` creates the target schema, indexes, triggers, and RLS policies
- `tests/transform.test.mjs` checks successful and rejected migrations
- `docs/migration-runbook.md` defines discovery, rehearsal, cutover, rollback, and support
- `docs/acceptance-checklist.md` defines evidence required before production cutover

## Honest boundaries

Base44 project schemas and export routes can vary. A real engagement starts with a read-only inventory of the supplied project, export format, authentication provider, storage, server functions, environment variables, and integrations. This proof is an adapter pattern, not a universal Base44 exporter.

Authentication migrations need special handling. Password hashes cannot be assumed portable. The production plan must choose a supported transfer method, staged password reset, or account linking flow after inspecting the source identity system and Supabase requirements.

No client data belongs in this repository. Production secrets stay in the client's environment and never enter source control.
