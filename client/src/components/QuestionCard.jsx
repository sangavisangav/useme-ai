import React from "react";
import { motion } from "framer-motion";
import { Building2, Lightbulb } from "lucide-react";

export default function QuestionCard({ data }) {
  if (!data) return null;

  const grouped = {};
  (data.questions || []).forEach((q) => {
    const round = q.round || "General";
    if (!grouped[round]) grouped[round] = [];
    grouped[round].push(q);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={18} className="text-gold-400" />
          <h3 className="font-display text-xl text-mist-100">{data.company}</h3>
        </div>
        <p className="text-mist-500 text-sm mb-4">{data.aboutCompany}</p>
        {data.interviewRounds?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.interviewRounds.map((r, i) => (
              <span key={i} className="text-xs bg-ink-700 text-mist-300 px-2.5 py-1 rounded-full">
                {i + 1}. {r}
              </span>
            ))}
          </div>
        )}
      </div>

      {Object.entries(grouped).map(([round, qs]) => (
        <div key={round}>
          <h4 className="text-mist-300 font-medium mb-3">{round}</h4>
          <div className="space-y-3">
            {qs.map((q, i) => (
              <div key={i} className="bg-ink-800 border border-ink-700 rounded-xl p-4">
                <p className="text-mist-100 text-sm font-medium mb-2">{q.question}</p>
                {q.tip && (
                  <p className="text-teal-400 text-xs flex items-start gap-1.5">
                    <Lightbulb size={13} className="mt-0.5 shrink-0" />
                    {q.tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
