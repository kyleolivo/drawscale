# drawscale
A system design interview prep tool.

# Commands

Run supabase functions locally:
```supabase functions serve --env-file ./supabase/.env.local --no-verify-jwt```

Curl a local supabase function:
```curl -X POST http://localhost:54321/functions/v1/transcribe \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: multipart/form-data" \
    -F "audio=@/path/to/audio.file"```

Learn about supabase commands (functions is what we use now):
```npx supabase --help```