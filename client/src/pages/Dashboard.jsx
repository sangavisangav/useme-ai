import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Sparkles, FileText, LogOut, Loader2, Send } from "lucide-react";
import api, { clearSession } from "../lib/api.js";
import VoiceInput from "../components/VoiceInput.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import CompanyGuess from "../components/CompanyGuess.jsx";
import ResumeUpload from "../components/ResumeUpload.jsx";

const TABS = [
  { id: "company", label: "Prepare for a company", icon: Building2 },
  { id: "skills", label: "Find companies for my skills", icon: Sparkles },
  { id: "resume", label: "Resume check", icon: FileText },
];

export default function Dashboard({ session, onLogout }) {
  const [tab, setTab] = useState("company");
  const isGuest = session.user.type === "guest";

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyResult, setCompanyResult] = useState(null);
  const [companyError, setCompanyError] = useState("");

  const [skills, setSkills] = useState("");
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsResult, setSkillsResult] = useState(null);
  const [skillsError, setSkillsError] = useState("");

  function handleLogout() {
    clearSession();
    onLogout();
  }

  async function generateQuestions(e) {
    e.preventDefault();
    if (!company.trim()) return;
    setCompanyLoading(true);
    setCompanyError("");
    setCompanyResult(null);
    try {
      const res = await api.post("/questions/generate", {
        company,
        role,
        guestId: session.user.guestId,
      });
      setCompanyResult(res.data);
    } catch (err) {
      setCompanyError(err.response?.data?.error || "Couldn't generate questions. Please try again.");
    } finally {
      setCompanyLoading(false);
    }
  }

  async function findCompanies(e) {
    e.preventDefault();
    if (!skills.trim()) return;
    setSkillsLoading(true);
    setSkillsError("");
    setSkillsResult(null);
    try {
      const res = await api.post("/questions/companies-for-skills", { skills });
      setSkillsResult(res.data);
    } catch (err) {
      setSkillsError(err.response?.data?.error || "Couldn't fetch suggestions. Please try again.");
    } finally {
      setSkillsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950">
      {/* header */}
      <header className="border-b border-ink-700 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 bg-ink-950/90 backdrop-blur z-20">
        <h1 className="font-display text-xl font-bold text-mist-100">
          useme <span className="text-gold-400">ai</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-mist-500 text-sm hidden sm:inline">
            {isGuest ? "Guest session" : session.user.name || session.user.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-mist-300 hover:text-mist-100 text-sm bg-ink-800 hover:bg-ink-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                  ${active ? "bg-gold-400 text-ink-950" : "bg-ink-800 text-mist-300 hover:bg-ink-700"}`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === "company" && (
            <motion.div key="company" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <form onSubmit={generateQuestions} className="bg-ink-800 border border-ink-700 rounded-2xl p-6 mb-6 space-y-4">
                <div>
                  <label className="text-mist-300 text-sm mb-1.5 block">Which company are you interviewing with?</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. TCS, Infosys, Wipro, Accenture, Zoho…"
                    className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-mist-100 outline-none focus:border-gold-400 placeholder:text-mist-500"
                  />
                </div>
                <div>
                  <label className="text-mist-300 text-sm mb-1.5 block">Role (optional)</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer Trainee"
                    className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-mist-100 outline-none focus:border-gold-400 placeholder:text-mist-500"
                  />
                </div>

                <VoiceInput
                  locked={isGuest}
                  context="Company name for interview prep"
                  onResult={(text) => setCompany(text)}
                />

                {companyError && <p className="text-sm text-red-400">{companyError}</p>}

                <button
                  type="submit"
                  disabled={companyLoading || !company.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-gold-400 text-ink-950 font-semibold py-3 rounded-xl disabled:opacity-40"
                >
                  {companyLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {companyLoading ? "Generating…" : "Generate mock questions"}
                </button>
              </form>

              {companyResult && <QuestionCard data={companyResult} />}
            </motion.div>
          )}

          {tab === "skills" && (
            <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <form onSubmit={findCompanies} className="bg-ink-800 border border-ink-700 rounded-2xl p-6 mb-6 space-y-4">
                <div>
                  <label className="text-mist-300 text-sm mb-1.5 block">What are your skills?</label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Python, React, SQL, Machine Learning, Java, DSA…"
                    rows={3}
                    className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-mist-100 outline-none focus:border-gold-400 placeholder:text-mist-500 resize-none"
                  />
                </div>

                <VoiceInput
                  locked={isGuest}
                  context="List of technical skills"
                  onResult={(text) => setSkills((prev) => (prev ? prev + ", " + text : text))}
                />

                {skillsError && <p className="text-sm text-red-400">{skillsError}</p>}

                <button
                  type="submit"
                  disabled={skillsLoading || !skills.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-gold-400 text-ink-950 font-semibold py-3 rounded-xl disabled:opacity-40"
                >
                  {skillsLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {skillsLoading ? "Finding…" : "Find matching companies"}
                </button>
              </form>

              {skillsResult && <CompanyGuess data={skillsResult} />}
            </motion.div>
          )}

          {tab === "resume" && (
            <motion.div key="resume" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResumeUpload locked={isGuest} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
