import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export default function CompanyGuess({ data }) {
  if (!data || !data.suggestions?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h4 className="text-mist-300 font-medium">Companies that match: {data.skills?.join(", ")}</h4>
      {data.suggestions.map((s, i) => (
        <div key={i} className="bg-ink-800 border border-ink-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={15} className="text-gold-400" />
            <p className="text-mist-100 font-medium text-sm">{s.company}</p>
          </div>
          <p className="text-mist-500 text-xs mb-2">{s.matchReason}</p>
          {s.typicalRoles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {s.typicalRoles.map((r, j) => (
                <span key={j} className="text-[11px] bg-ink-700 text-mist-300 px-2 py-0.5 rounded-full">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}
