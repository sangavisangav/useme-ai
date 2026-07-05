import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2, Lock, CheckCircle2, Building2 } from "lucide-react";
import api from "../lib/api.js";

export default function ResumeUpload({ locked = false }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't analyze this resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (locked) {
    return (
      <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8 text-center">
        <Lock className="mx-auto text-mist-500 mb-3" size={28} />
        <h3 className="font-display text-lg text-mist-100 mb-1">Resume correction is a full-account feature</h3>
        <p className="text-mist-500 text-sm">Sign up with email to upload your resume, auto-fix mistakes, and get matching company suggestions.</p>
      </div>
    );
  }

  return (
    <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6">
      <h3 className="font-display text-lg text-mist-100 mb-1">Upload your resume</h3>
      <p className="text-mist-500 text-sm mb-4">PDF or TXT. We'll fix mistakes and suggest companies that match your skills.</p>

      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-600 rounded-xl py-8 cursor-pointer hover:border-gold-400 transition-colors">
        <UploadCloud className="text-mist-500" size={28} />
        <span className="text-mist-300 text-sm">{file ? file.name : "Click to choose a file"}</span>
        <input
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-gold-400 text-ink-950 font-semibold py-3 rounded-xl disabled:opacity-40"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        {loading ? "Analyzing…" : "Analyze resume"}
      </button>

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-5"
        >
          {result.mistakesFixed?.length > 0 && (
            <div>
              <h4 className="text-mist-300 font-medium text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-teal-400" /> Mistakes fixed
              </h4>
              <ul className="space-y-1">
                {result.mistakesFixed.map((m, i) => (
                  <li key={i} className="text-mist-500 text-sm pl-5 relative before:content-['•'] before:absolute before:left-1">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.skills?.length > 0 && (
            <div>
              <h4 className="text-mist-300 font-medium text-sm mb-2">Skills detected</h4>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s, i) => (
                  <span key={i} className="text-xs bg-ink-700 text-mist-100 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestedCompanies?.length > 0 && (
            <div>
              <h4 className="text-mist-300 font-medium text-sm mb-2 flex items-center gap-1.5">
                <Building2 size={15} className="text-gold-400" /> Companies that match your resume
              </h4>
              <div className="space-y-2">
                {result.suggestedCompanies.map((c, i) => (
                  <div key={i} className="bg-ink-900 border border-ink-700 rounded-xl p-3">
                    <p className="text-mist-100 font-medium text-sm">{c.company}</p>
                    <p className="text-mist-500 text-xs mt-0.5">{c.matchReason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.correctedText && (
            <details className="bg-ink-900 border border-ink-700 rounded-xl p-3">
              <summary className="text-mist-300 text-sm cursor-pointer">View corrected resume text</summary>
              <p className="text-mist-500 text-xs whitespace-pre-wrap mt-2 leading-relaxed">{result.correctedText}</p>
            </details>
          )}
        </motion.div>
      )}
    </div>
  );
}
