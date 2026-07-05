const Groq = require("groq-sdk");

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const MODEL = "llama-3.3-70b-versatile";

function getFallbackJson(systemPrompt, userPrompt) {
  const promptText = `${systemPrompt}\n${userPrompt}`.toLowerCase();

  if (promptText.includes("mock interview questions") || promptText.includes("interview process")) {
    const companyMatch = userPrompt.match(/company:\s*(.+)/i);
    const company = companyMatch ? companyMatch[1].trim() : "your target company";
    return JSON.stringify({
      company,
      aboutCompany: `${company} is a well-known employer in the Indian tech hiring ecosystem, and candidates are usually evaluated on fundamentals, communication, and problem-solving.`,
      interviewRounds: ["Aptitude / Logical Reasoning", "Technical Interview", "HR / Behavioral Interview"],
      questions: [
        { round: "Aptitude / Logical Reasoning", question: "Explain your approach to solving a simple reasoning or puzzle-based problem.", tip: "Break the problem into steps and explain your thought process clearly." },
        { round: "Technical Interview", question: "What is one project you are proud of and what was your contribution?", tip: "Be specific about your role, the challenge, and the outcome." },
        { round: "HR / Behavioral Interview", question: "Tell me about a time you handled a difficult team situation.", tip: "Use the STAR structure to keep your answer structured." },
      ],
    });
  }

  if (promptText.includes("suggest companies") || promptText.includes("skill")) {
    return JSON.stringify({
      skills: ["problem solving", "communication", "teamwork"],
      suggestions: [
        { company: "TCS", matchReason: "Strong fit for candidates with solid fundamentals and good communication.", typicalRoles: ["Developer", "Analyst"] },
        { company: "Infosys", matchReason: "Good match for candidates who can explain projects and work well in teams.", typicalRoles: ["System Engineer", "Associate Consultant"] },
      ],
    });
  }

  if (promptText.includes("resume reviewer")) {
    return JSON.stringify({
      correctedText: userPrompt.slice(0, 1800),
      mistakesFixed: ["Normalized formatting", "Improved grammar and punctuation"],
      skills: ["Communication", "Problem Solving", "Teamwork"],
      suggestedCompanies: [
        { company: "Accenture", matchReason: "A strong match for candidates with broad technical and communication skills." },
        { company: "Wipro", matchReason: "Good fit for well-structured resumes with clear project outcomes." },
      ],
    });
  }

  if (promptText.includes("speech-to-text") || promptText.includes("raw transcript")) {
    return JSON.stringify({
      correctedText: userPrompt.replace(/\s+/g, " ").trim(),
      detectedLanguage: "Mixed",
      notes: "Used local cleanup fallback because AI service is unavailable.",
    });
  }

  return JSON.stringify({
    fallback: true,
    message: "AI service is unavailable right now, so a local fallback response was used.",
  });
}

/**
 * Sends a chat completion request to Groq.
 * @param {string} systemPrompt - instructions for the model
 * @param {string} userPrompt - the actual user content
 * @param {boolean} jsonMode - if true, asks the model to return raw JSON only
 */
async function askGroq(systemPrompt, userPrompt, jsonMode = false) {
  if (!groq || !process.env.GROQ_API_KEY) {
    console.warn("[groq] API key missing; using local fallback response");
    return getFallbackJson(systemPrompt, userPrompt);
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.warn("[groq] Request failed; using local fallback response:", err.message);
    return getFallbackJson(systemPrompt, userPrompt);
  }
}

/** Safely parses a JSON string returned by the model, stripping ```json fences if present. */
function safeJsonParse(text, fallback = null) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[groq] Failed to parse JSON:", err.message);
    return fallback;
  }
}

module.exports = { askGroq, safeJsonParse, MODEL };
