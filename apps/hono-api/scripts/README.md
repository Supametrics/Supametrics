# Migration Scripts

## Event Type Migration

### migrate-event-types.ts

This script migrates all `page_view` event types to `pageview` for consistency across the application.

**Usage:**

```bash
cd apps/hono-api
pnpm migrate:event-types
```

**What it does:**

1. Counts all records with `event_type = 'page_view'`
2. Updates them to `event_type = 'pageview'`
3. Verifies the migration was successful
4. Shows a summary of all event types in the database

**Safety:**

- The script is idempotent (safe to run multiple times)
- It will show "No records to migrate" if all records are already updated
- Includes verification step to ensure migration completed successfully
