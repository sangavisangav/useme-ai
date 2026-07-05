const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { pool } = require("../db");
const { askGroq, safeJsonParse } = require("../utils/groq");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Resume features are only for logged-in (email) users, not guests.
function requireFullAccount(req, res, next) {
  if (!req.auth || req.auth.type !== "user") {
    return res.status(403).json({
      error: "Resume analysis is available for registered accounts only. Please sign up with email to unlock this feature.",
    });
  }
  next();
}

/**
 * POST /api/resume/analyze
 * multipart form-data with field "resume" (pdf or txt file)
 * Extracts text, fixes mistakes/formatting issues, pulls out skills, and suggests matching companies.
 */
router.post("/analyze", requireFullAccount, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a resume file (PDF or TXT)" });
    }

    let rawText = "";
    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      rawText = data.text;
    } else {
      rawText = req.file.buffer.toString("utf-8");
    }

    if (!rawText || rawText.trim().length < 30) {
      return res.status(400).json({ error: "Couldn't read enough text from this file. Try a different resume file." });
    }

    const systemPrompt = `You are an expert resume reviewer and career coach for Indian campus placement candidates.
Given raw resume text (which may have extraction glitches, spelling mistakes, or awkward phrasing), do the following:
1. Correct spelling, grammar, and formatting mistakes while keeping all factual content (names, dates, project details, companies) exactly the same - do not invent new experience.
2. Extract a clean list of technical and soft skills mentioned.
3. Suggest 6-8 companies (mix of IT services and product companies) that would be a good match for this candidate's skills, with a short reason each.

Respond ONLY with valid JSON, no markdown, in this exact shape:
{
  "correctedText": "the full corrected resume text, mistakes fixed, same structure as original",
  "mistakesFixed": ["short list of the kinds of mistakes that were fixed, e.g. 'Fixed spelling of Javascript to JavaScript'"],
  "skills": ["skill1", "skill2"],
  "suggestedCompanies": [
    { "company": "name", "matchReason": "why this company fits this resume" }
  ]
}`;

    const raw = await askGroq(systemPrompt, rawText.slice(0, 6000), true);
    const parsed = safeJsonParse(raw);

    if (!parsed) {
      return res.status(500).json({ error: "Could not analyze resume right now. Please try again." });
    }

    try {
      await pool.query(
        "INSERT INTO resumes (user_id, original_text, corrected_text, skills, suggested_companies) VALUES ($1, $2, $3, $4, $5)",
        [
          req.auth.userId,
          rawText.slice(0, 8000),
          parsed.correctedText || null,
          JSON.stringify(parsed.skills || []),
          JSON.stringify(parsed.suggestedCompanies || []),
        ]
      );
    } catch (dbErr) {
      console.error("[resume/analyze] DB save failed:", dbErr.message);
    }

    res.json(parsed);
  } catch (err) {
    console.error("[resume/analyze]", err.message);
    res.status(500).json({ error: "Something went wrong analyzing your resume." });
  }
});

module.exports = router;
