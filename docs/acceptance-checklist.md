# Acceptance checklist

## Data

- source and target counts match for every agreed entity
- every imported source identifier is unique
- every foreign key resolves
- required values are present and normalized
- timestamps preserve the intended time zone and order
- file counts and sampled hashes match when storage is in scope

## Authentication and authorization

- approved user migration or reset flow is documented
- sign-up, sign-in, reset, logout, and session expiry pass
- anonymous users cannot read protected rows
- authenticated users can access only their own permitted rows
- service-role credentials are restricted to server-side use

## Application

- existing GitHub code builds from a clean checkout
- all source-platform calls are replaced or deliberately retained
- environment variables are documented without secret values
- core user journeys pass in staging
- errors are logged without exposing secrets or private data

## Cutover and ownership

- client owns the Supabase project and deployment workspace
- production backup and rollback steps are tested
- the final reconciliation report is saved
- the client approves the maintenance window and launch
- documentation and the agreed support window are delivered
