# useme ai

AI-powered interview prep agent — company-specific mock questions, resume mistake correction with
company matching, and voice input in Tamil / English / Tanglish.

**Stack:** React + Vite + Tailwind + Framer Motion (frontend) · Node.js + Express (backend) ·
Groq (`llama-3.3-70b-versatile`) for AI · Neon Postgres for storage.

---

## Idhu epdi work aagum (quick summary in Thanglish)

- **Guest login** → udane app ku pogalam. Company name podunga (TCS, Infosys, Wipro etc.) → adhukku
  etha mock interview questions + rounds + tips generate aagum.
- **Email login (sign up)** → extra features unlock aagum:
  - 🎙️ **Voice input** — Tamil / English / Tanglish la pesalam, mistake irundhalum AI correct pannum.
  - 📄 **Resume upload** — PDF/TXT upload pannunga, mistakes fix aagum, skills extract aagi, andha
    skills ku etha companies fit aagum nu solum.
  - 🧠 **Skills → Companies** — ungala skills type pannunga (illa voice la sollunga), matching
    companies suggest pannum.

---

## 1. What you need before running this

1. **Node.js 18+** installed — check with `node -v` in a terminal.
2. A **free Groq API key** → https://console.groq.com/keys (sign up, create a key).
3. A **free Neon Postgres database** → https://console.neon.tech (sign up, create a project,
   copy the connection string from "Connection Details").

---

## 2. Setup (do this once)

1. Unzip this folder and open it in VS Code.
2. Open a terminal in VS Code (`` Ctrl + ` ``) at the project root (the folder with this README).
3. Copy the environment file:
   ```bash
   cp .env.example server/.env
   ```
   On Windows (PowerShell): `copy .env.example server\.env`
4. Open `server/.env` and paste in your real values:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   JWT_SECRET=any-long-random-string-you-like
   PORT=5000
   ```
5. Install everything with one command (installs both server and client):
   ```bash
   npm install
   ```

---

## 3. Run it

From the project root:

```bash
npm run dev
```

This starts **both** the backend (port 5000) and frontend (port 5173) together, and your browser
will automatically open `http://localhost:5173` — the app is ready to use immediately.

To stop, press `Ctrl + C` in the terminal.

---

## 4. Project structure

```
useme-ai/
├── server/                  Express backend
│   ├── server.js            entry point
│   ├── db.js                Neon Postgres connection + table setup
│   ├── routes/
│   │   ├── auth.js          guest login, email signup/login
│   │   ├── questions.js     mock question generation, skills→companies
│   │   ├── resume.js        resume upload, correction, skill/company matching
│   │   └── voice.js         voice transcript correction (Tamil/English/Tanglish)
│   └── utils/groq.js        Groq API helper
├── client/                  React (Vite) frontend
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx   logo animation + loading screen
│       │   ├── LoginPage.jsx     guest / email login
│       │   └── Dashboard.jsx     main app (3 tabs)
│       └── components/
│           ├── VoiceInput.jsx
│           ├── ResumeUpload.jsx
│           ├── QuestionCard.jsx
│           └── CompanyGuess.jsx
└── .env.example
```

---

## 5. Notes

- **Voice input** uses your browser's built-in speech recognition (best in Chrome/Edge). It only
  works on `localhost` or `https` sites, which is already the case here.
- Guest sessions don't require the database, but email signup/login and saving history do — make
  sure `DATABASE_URL` is set correctly.
- If `npm run dev` fails on first try, run `npm install` again inside `server/` and `client/`
  individually:
  ```bash
  cd server && npm install && cd ../client && npm install && cd ..
  ```
