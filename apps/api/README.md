# CyberSafe API — Render deployment

FastAPI backend for reports, quiz grading, and analytics.

## Render settings

- Root directory: `apps/api`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `ALLOWED_ORIGINS`
