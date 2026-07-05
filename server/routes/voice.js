const express = require("express");
const { askGroq, safeJsonParse } = require("../utils/groq");

const router = express.Router();

function requireFullAccount(req, res, next) {
  if (!req.auth || req.auth.type !== "user") {
    return res.status(403).json({
      error: "Voice input is available for registered accounts only. Please sign up with email to unlock this feature.",
    });
  }
  next();
}

/**
 * POST /api/voice/correct
 * body: { transcript, context }
 * Browser speech recognition often mishears Tamil/English/Tanglish mixed speech.
 * This cleans up the raw transcript into correct, well-formed text while keeping the
 * original language mix and meaning intent intact (does not force-translate to English).
 */
router.post("/correct", requireFullAccount, async (req, res) => {
  try {
    const { transcript, context } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "No speech text received" });
    }

    const systemPrompt = `You correct raw speech-to-text transcripts that may be in Tamil, English, or Tanglish (Tamil words written in English/Roman script mixed with English words).
The speech recognizer often mishears words, breaks sentences oddly, or mixes up similar-sounding words.
Your job: fix recognition mistakes, fix spelling, add correct punctuation and casing, and make the sentence read naturally - WITHOUT changing the speaker's intended language mix (if they spoke Tanglish, keep it Tanglish; do not translate everything to English).
If a proper noun (like a company name) is mangled (e.g. "in foe sis" -> "Infosys", "tee see yes" -> "TCS"), fix it to the correct spelling.

Respond ONLY with valid JSON, no markdown, in this exact shape:
{
  "correctedText": "the cleaned up, corrected text",
  "detectedLanguage": "one of: Tamil, English, Tanglish, Mixed",
  "notes": "very short note on what was fixed, or empty string if nothing notable"
}`;

    const userPrompt = `Context (what this input is for, may be empty): ${context || "general use"}\n\nRaw transcript:\n${transcript}`;

    const raw = await askGroq(systemPrompt, userPrompt, true);
    const parsed = safeJsonParse(raw);

    if (!parsed) {
      return res.status(500).json({ error: "Could not process voice input right now." });
    }

    res.json(parsed);
  } catch (err) {
    console.error("[voice/correct]", err.message);
    res.status(500).json({ error: "Something went wrong processing your voice input." });
  }
});

module.exports = router;
