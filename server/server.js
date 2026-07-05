require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { initDb } = require("./db");
const { router: authRouter, verifyToken } = require("./routes/auth");
const questionsRouter = require("./routes/questions");
const resumeRouter = require("./routes/resume");
const voiceRouter = require("./routes/voice");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Serve static files from client/dist
const clientPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientPath));

app.use(verifyToken); // attaches req.auth (null if no/invalid token) to every request

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "UseMe AI backend is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/voice", voiceRouter);

// Fallback: serve index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"), (err) => {
    if (err) {
      res.status(404).json({ error: "Frontend not built. Build the client first." });
    }
  });
});

// Generic error handler (catches anything that slipped through)
app.use((err, req, res, next) => {
  console.error("[unhandled error]", err);
  res.status(500).json({ error: "Unexpected server error" });
});

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error("[server] Could not connect to database. Check DATABASE_URL in your .env file.");
    console.error(err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n  UseMe AI backend running -> http://localhost:${PORT}\n`);
  });
}

start();
