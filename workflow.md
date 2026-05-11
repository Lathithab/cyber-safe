# Cyber Platform MVP — Local Setup Guide

## Tech Stack

### Frontend

- Next.js (JavaScript)
- TailwindCSS
- Supabase Client

### Backend

- FastAPI (Python)

### Database/Auth

- Supabase

### Repo Structure

```txt
cyber-safe/
│
├── apps/
│   ├── web/        # Next.js frontend
│   └── api/        # FastAPI backend
```

---

# 1. Install Required Software

## Install Node.js

Download and install the LTS version:

[https://nodejs.org](https://nodejs.org)

Verify installation:

```using powershell in your VS terminal
node -v
npm -v
```

You should see the version number. If not, then something went wrong

---

## Install Python

Download:

[https://www.python.org/downloads/](https://www.python.org/downloads/)

IMPORTANT:
During installation:

- tick “Add Python to PATH”

Verify installation:

```powershell using powershell in your VS terminal
py --version
```

You should see the version number. If not, then something went wrong

---

Recommended extensions:

- Python
- Prettier (Formatting)

---

# 2. Clone The Repository

In PowerShell:

```powershell
gh repo clone Lathithab/cyber-safe
cd cyber-safe
```

---

# 3. Frontend Setup (Next.js)

Go to frontend folder:

```powershell
cd apps/web
```

Install dependencies:

```powershell
npm install
```

Create environment file:

```txt
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Run frontend:

```powershell
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

# 4. Backend Setup (FastAPI)

Open a NEW terminal.

Go to backend:

```powershell
cd cyber-platform/apps/api
```

Create virtual environment:

```powershell
py -m venv venv
```

Activate virtual environment:

```powershell
venv\Scripts\activate
```

Install packages:

```powershell
pip install fastapi uvicorn
```

Run backend:

```powershell
uvicorn main:app --reload
```

Backend runs on:

```txt
http://127.0.0.1:8000
```

## Tho exit (venv) mode just type deactivate

# 5. Git Workflow

## Before starting work

Pull latest changes:

```powershell
git checkout develop
git pull origin develop
```

---

## Create a feature branch

Example:

```powershell
git checkout -b feature/feed-ui
```

---

## Save work

```powershell
git add .
git commit -m "feat: add incident feed cards"
```

---

## Push branch

```powershell
git push origin feature/feed-ui
```

Then create a Pull Request on GitHub.

---

# 6. Important Rules

## DO NOT PUSH:

- `.env.local`
- `venv/`
- `node_modules/`

These should already be in `.gitignore`.

---

# 7. Suggested Responsibilities

## Frontend

- authentication UI
- incident feed UI
- report submission form
- dashboard pages

## Backend

- AI endpoints
- moderation logic
- analytics endpoints

## Database/Auth

- Supabase schema
- row level security
- storage buckets
- authentication

---

# 8. Current MVP Scope

Potentially: Will decide as a group

- Login/Register
- Incident report submission
- Incident feed
- Optional image upload
- Admin approval/rejection
- Basic learner/admin roles
