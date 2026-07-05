import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/api.js";

const BAR_COUNT = 24;

export default function LandingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("bars"); // bars -> wordmark -> loading -> done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("wordmark"), 900);
    const t2 = setTimeout(() => setPhase("loading"), 1700);
    const t3 = setTimeout(() => {
      const session = getSession();
      navigate(session ? "/app" : "/login", { replace: true });
    }, 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-ink-950 flex flex-col items-center justify-center overflow-hidden relative">
      {/* ambient glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-3xl -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gold-500/10 blur-3xl -bottom-40 -right-40" />

      {/* waveform bars that settle into the wordmark's underline */}
      <div className="flex items-end gap-[3px] h-16 mb-6 relative z-10">
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const mid = BAR_COUNT / 2;
          const distFromMid = Math.abs(i - mid);
          const baseHeight = 12 + (mid - distFromMid) * 3;
          return (
            <motion.div
              key={i}
              className="w-[4px] rounded-full bg-gradient-to-t from-teal-400 to-gold-400"
              initial={{ height: 4 }}
              animate={{
                height: phase === "bars" ? [4, baseHeight, 6, baseHeight * 0.7, 4] : 4,
                opacity: phase === "bars" ? 1 : 0,
              }}
              transition={{
                duration: 0.9,
                repeat: phase === "bars" ? Infinity : 0,
                delay: i * 0.02,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      <motion.h1
        className="font-display text-6xl md:text-7xl font-800 tracking-tight text-mist-100 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: phase === "bars" ? 0 : 1,
          y: phase === "bars" ? 40 : 0,
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        useme <span className="text-gold-400">ai</span>
      </motion.h1>

      <motion.p
        className="mt-3 text-mist-500 font-body relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "bars" ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Interview prep, sorted.
      </motion.p>

      <motion.div
        className="mt-10 h-1 w-40 rounded-full bg-ink-700 overflow-hidden relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "loading" || phase === "wordmark" ? 1 : 0 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 to-gold-400"
          initial={{ x: "-100%" }}
          animate={{ x: phase === "loading" ? "0%" : "-100%" }}
          transition={{ duration: 1.3, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
