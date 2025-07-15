# drawscale
A system design interview prep tool.

## Development Setup

## Commands

Run supabase functions locally:
```bash
npx supabase start
npx supabase functions serve --env-file .env.local --no-verify-jwt
```

Curl a local supabase function:
```bash
curl -X POST http://localhost:54321/functions/v1/transcribe \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: multipart/form-data" \
    -F "audio=@/path/to/audio.file"
```

Learn about supabase commands (functions is what we use now):
```bash
npx supabase --help
```

### Pre-Push Hook

Install the git pre-push hook to automatically validate your code before pushing:

```bash
./scripts/install-pre-push-hook.sh
```

This will run linting, unit tests, and E2E tests before each push.
