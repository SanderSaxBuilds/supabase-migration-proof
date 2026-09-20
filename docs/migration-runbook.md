# Migration runbook

## 1. Discovery and freeze criteria

Collect a read-only inventory of source entities, record counts, identifiers, relationships, files, authentication, server functions, environment variables, scheduled work, and third-party integrations. Record the current Git commit and export timestamp. Agree on who can approve a temporary write freeze.

Do not assume that this synthetic adapter matches a real Base44 export. Add field mappings only after inspecting the supplied code and export.

## 2. Authentication decision

Identify the current identity provider and whether it offers a supported user export. Password hashes may be incompatible or unavailable. Choose one documented path:

1. supported direct identity migration
2. staged invitation and password reset
3. account linking after verified email ownership

Never copy password material into source control. Test sign-up, sign-in, reset, session expiry, logout, and authorization with non-production accounts.

## 3. Rehearsal

1. Create an isolated Supabase project owned by the client.
2. Apply versioned SQL migrations.
3. Export a dated source snapshot.
4. Run the deterministic transform.
5. Import users through the approved authentication path.
6. Import parent tables before child tables.
7. compare source counts, target counts, identifiers, nulls, and sampled records.
8. Run application smoke tests and row-level security tests.
9. Measure the rehearsal duration and document every manual step.

## 4. Cutover

1. Confirm an approved maintenance window and rollback owner.
2. Back up the current production system.
3. Enable the agreed write freeze.
4. Export the final source delta.
5. Run the same tested transform and import sequence.
6. Reconcile counts and checksums.
7. Deploy code with environment variables in the hosting platform.
8. Test authentication, core create-read-update-delete paths, files, integrations, and access boundaries.
9. Obtain client approval before switching traffic.

## 5. Rollback

Keep the original system unchanged and available through the agreed rollback window. If a critical acceptance check fails, stop writes to the target, restore routing to the source, preserve failure evidence, and reconcile any target-only writes before another attempt.

## 6. Handoff and support

Deliver the schema, migrations, transform version, reconciliation report, environment-variable inventory without secret values, deployment steps, rollback record, known limitations, and owner access. Agree on a short support window and define what becomes a new scope.
