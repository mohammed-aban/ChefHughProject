# ChefHughProject

React + Vite app that generates recipes from ingredients using a secure serverless API on Vercel.

## Local development

1. Install dependencies:

	```bash
	npm install
	```

2. Create `.env.local` for frontend settings:

	```bash
	VITE_API_BASE_URL=
	```

	Or copy from `.env.example` and fill in your own values.

	- Keep `VITE_API_BASE_URL` empty when frontend and backend are served from the same origin.
	- For local Vite dev (`npm run dev`) against a deployed backend, set this to your deployed Vercel URL, for example:
	  `VITE_API_BASE_URL=https://your-project.vercel.app`

3. Start app:

	```bash
	npm run dev
	```

## Secure deployment on Vercel

### 1) Push project to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2) Import repo in Vercel

- In Vercel dashboard, choose **Add New Project** and import your GitHub repo.
- Framework preset: **Vite** (auto-detected).

### 3) Set environment variables in Vercel

- `HF_ACCESS_TOKEN`: your Hugging Face token.
- `ALLOWED_ORIGINS`: comma-separated allowed origins.
  Example:
  `http://localhost:5173,https://your-project.vercel.app`

### 4) Deploy

- Trigger deploy from Vercel UI (or push to `main`).
- Your frontend and `/api/recipe` run on the same Vercel project.

## Security notes

- Do **not** put `HF_ACCESS_TOKEN` in frontend env vars.
- Frontend calls `/api/recipe`; serverless function calls Hugging Face with server-side secret.
- Commit `.env.example`, but do not commit `.env.local`.
