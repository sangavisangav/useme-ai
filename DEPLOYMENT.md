# Deployment Guide - Render

## Quick Start

This project is configured to deploy on [Render](https://render.com).

### Backend Deployment (Node.js)

1. Go to https://render.com and sign up
2. Click "New" → "Web Service"
3. Select your GitHub repo (sangavisangav/useme-ai)
4. Configuration:
   - **Name:** useme-ai-backend
   - **Environment:** Node
   - **Region:** Oregon (or your choice)
   - **Branch:** main
   - **Build Command:** `npm install --prefix server`
   - **Start Command:** `cd server && npm start`
5. Add environment variables under "Advanced":
   - `GROQ_API_KEY` = [your Groq API key]
   - `DATABASE_URL` = [your Neon Postgres connection string]
   - `JWT_SECRET` = [any long random string]
   - `PORT` = 5000
6. Click "Create Web Service"
7. Copy the backend URL (will be like `https://useme-ai-backend.onrender.com`)

### Frontend Deployment (Static Site)

1. In Render, click "New" → "Static Site"
2. Select your GitHub repo (sangavisangav/useme-ai)
3. Configuration:
   - **Name:** useme-ai-frontend
   - **Branch:** main
   - **Build Command:** `npm install && npm run build --prefix client`
   - **Publish Directory:** `client/dist`
4. Add environment variable:
   - `VITE_API_URL` = [your backend URL from step 7 above]
5. Click "Create Static Site"

### Get API Keys

Before deployment, you'll need:

- **Groq API Key:** https://console.groq.com/keys (free)
- **Neon Postgres:** https://console.neon.tech (free tier available)
- **JWT Secret:** Any random string (e.g., generate one online)

### After Deployment

Once both services are deployed:
- Frontend will be available at: `https://useme-ai-frontend.onrender.com`
- Backend will be available at: `https://useme-ai-backend.onrender.com/api/health`

The frontend will automatically connect to the backend via the `VITE_API_URL` environment variable.

### Testing

Visit your frontend URL and test:
- Guest login (works without database)
- Generate mock questions (uses AI or fallback)
- Email signup (requires database)

## Troubleshooting

- **Backend won't start:** Check environment variables, especially `GROQ_API_KEY` and `DATABASE_URL`
- **Frontend blank page:** Check browser console for API connection errors
- **Build fails:** Ensure all dependencies are in package.json files

For more info, visit: https://render.com/docs
