const express = require("express");
const { pool } = require("../db");
const { askGroq, safeJsonParse } = require("../utils/groq");

const router = express.Router();

/**
 * POST /api/questions/generate
 * body: { company, role, resumeText }
 * Generates mock interview questions tailored to a specific company (and role/resume if given).
 */
router.post("/generate", async (req, res) => {
  try {
    const { company, role, resumeText, guestId } = req.body;
    if (!company || !company.trim()) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const systemPrompt = `You are an expert campus placement interview coach for Indian IT services and product companies (like TCS, Infosys, Wipro, Accenture, Cognizant, HCL, Capgemini, product companies, startups, etc).
Given a company name (and optionally a candidate's role and resume), generate realistic mock interview questions and useful info about that company's interview process.
Respond ONLY with a valid JSON object, no markdown, no extra text, in this exact shape:
{
  "company": "string - cleaned up company name",
  "aboutCompany": "2-3 sentence summary of what this company does and what it typically looks for in candidates",
  "interviewRounds": ["array of round names typically used by this company, e.g. Aptitude Test, Technical Interview, HR Interview"],
  "questions": [
    { "round": "round name", "question": "the question text", "tip": "one line tip on how to answer well" }
  ]
}
Generate 10-15 questions spread across the rounds, mixing aptitude/logical reasoning, technical/coding, and HR/behavioral questions appropriate to that company's known style. If you're not fully certain of a company's exact process, give a realistic best-effort based on common patterns for similar companies and say so briefly in aboutCompany.`;

    let userPrompt = `Company: ${company}\nRole: ${role || "Not specified - assume entry level / fresher campus placement role"}`;
    if (resumeText) {
      userPrompt += `\n\nCandidate resume (for personalizing some questions):\n${resumeText.slice(0, 3000)}`;
    }

    const raw = await askGroq(systemPrompt, userPrompt, true);
    const parsed = safeJsonParse(raw);

    if (!parsed) {
      return res.status(500).json({ error: "Could not generate questions right now. Please try again." });
    }

    // Save session to DB (best-effort, don't fail the request if this errors)
    try {
      await pool.query(
        "INSERT INTO interview_sessions (user_id, guest_id, company, role, questions) VALUES ($1, $2, $3, $4, $5)",
        [req.auth?.userId || null, req.auth?.guestId || guestId || null, company, role || null, JSON.stringify(parsed)]
      );
    } catch (dbErr) {
      console.error("[questions/generate] DB save failed:", dbErr.message);
    }

    res.json(parsed);
  } catch (err) {
    console.error("[questions/generate]", err.message);
    res.status(500).json({ error: "Something went wrong generating questions." });
  }
});

/**
 * POST /api/questions/companies-for-skills
 * body: { skills: string or array }
 * Suggests companies that typically hire for the given skill set.
 */
router.post("/companies-for-skills", async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      return res.status(400).json({ error: "Please provide at least one skill" });
    }

    const skillsText = Array.isArray(skills) ? skills.join(", ") : skills;

    const systemPrompt = `You are a career advisor specializing in Indian campus placements and tech hiring.
Given a list of skills, suggest companies (mix of IT services companies like TCS/Infosys/Wipro/Accenture/Cognizant, product companies, and relevant startups) that commonly hire for those skills, and why.
Respond ONLY with valid JSON, no markdown, no extra text, in this exact shape:
{
  "skills": ["cleaned up list of skills provided"],
  "suggestions": [
    { "company": "name", "matchReason": "1-2 sentence reason this company suits these skills", "typicalRoles": ["role1", "role2"] }
  ]
}
Give 6-10 suggestions, ordered from strongest match to weakest.`;

    const raw = await askGroq(systemPrompt, `Skills: ${skillsText}`, true);
    const parsed = safeJsonParse(raw);

    if (!parsed) {
      return res.status(500).json({ error: "Could not generate suggestions right now. Please try again." });
    }

    res.json(parsed);
  } catch (err) {
    console.error("[questions/companies-for-skills]", err.message);
    res.status(500).json({ error: "Something went wrong generating suggestions." });
  }
});

module.exports = router;
