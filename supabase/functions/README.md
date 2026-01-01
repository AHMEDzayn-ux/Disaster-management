# Supabase Edge Functions Directory

This folder contains Supabase Edge Functions for secure server-side operations.

## Functions

### `secure-admin-delete`

Handles secure deletion of records with:

- JWT token verification
- Admin role validation
- Complete audit logging
- Snapshot preservation for recovery

## Deployment

See [SECURE_DELETE_SETUP.md](../SECURE_DELETE_SETUP.md) for full deployment instructions.

## Local Development

```bash
# Start local Supabase (requires Docker)
supabase start

# Serve functions locally
supabase functions serve

# Test function
curl -X POST http://localhost:54321/functions/v1/secure-admin-delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table": "camp_requests", "recordId": "uuid-here", "reason": "test"}'
```
