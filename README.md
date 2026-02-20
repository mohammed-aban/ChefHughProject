# ChefHughProject

ChefHughProject is a React + Vite app that turns your ingredients into recipe ideas.
The frontend talks to a secure serverless API on Vercel, so your Hugging Face token stays on the server.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` for frontend settings:

```bash
VITE_API_BASE_URL=
```

You can also copy `.env.example` and fill in your values.

- Leave `VITE_API_BASE_URL` empty if frontend and backend are served from the same origin.
- If running local Vite (`npm run dev`) against a deployed backend, set it to your Vercel URL, for example:
  `VITE_API_BASE_URL=https://your-project.vercel.app`

3. Start the app:

```bash
npm run dev
```

## Deploy to Vercel

### 1) Push the project to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2) Import the repo in Vercel

- In the Vercel dashboard, select **Add New Project**.
- Import your GitHub repository.
- Keep the framework preset as **Vite** (auto-detected).

### 3) Add environment variables in Vercel

- `HF_ACCESS_TOKEN`: your Hugging Face access token.
- `ALLOWED_ORIGINS`: comma-separated list of allowed origins.

Example:
`http://localhost:5173,https://your-project.vercel.app`

### 4) Deploy

- Deploy from the Vercel UI (or push to `main`).
- Frontend and `/api/recipe` are hosted in the same Vercel project.

## Security checklist

- Never put `HF_ACCESS_TOKEN` in frontend-exposed variables.
- Frontend calls `/api/recipe`; only the serverless function talks to Hugging Face.
- Commit `.env.example` for contributors, but keep `.env.local` private.
