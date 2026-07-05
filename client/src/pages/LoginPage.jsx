import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserRound, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import api, { saveSession } from "../lib/api.js";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup"); // signup | login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGuest() {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/guest");
      saveSession(res.data.token, res.data.user);
      onLogin({ token: res.data.token, user: res.data.user });
      navigate("/app");
    } catch (err) {
      setError("Couldn't start a guest session. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const res = await api.post(endpoint, { email, password, name });
      saveSession(res.data.token, res.data.user);
      onLogin({ token: res.data.token, user: res.data.user });
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-ink-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-3xl -top-32 -left-32" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gold-500/10 blur-3xl -bottom-32 -right-32" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-mist-100">
            useme <span className="text-gold-400">ai</span>
          </h1>
          <p className="text-mist-500 mt-2">Company-specific mock interviews, resume fixes, and voice input — Tamil, English or Tanglish.</p>
        </div>

        <div className="bg-ink-800/80 backdrop-blur border border-ink-700 rounded-2xl p-6 shadow-2xl">
          {/* Guest login */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-ink-700 hover:bg-ink-600 transition-colors text-mist-100 font-medium py-3 rounded-xl disabled:opacity-50"
          >
            <UserRound size={18} />
            Continue as Guest
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-ink-700 flex-1" />
            <span className="text-mist-500 text-xs uppercase tracking-wider">or use email</span>
            <div className="h-px bg-ink-700 flex-1" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === "signup" && (
              <div className="flex items-center gap-2 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 focus-within:border-gold-400">
                <UserRound size={16} className="text-mist-500" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-mist-100 placeholder:text-mist-500"
                />
              </div>
            )}
            <div className="flex items-center gap-2 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 focus-within:border-gold-400">
              <Mail size={16} className="text-mist-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none flex-1 text-mist-100 placeholder:text-mist-500"
              />
            </div>
            <div className="flex items-center gap-2 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 focus-within:border-gold-400">
              <Lock size={16} className="text-mist-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none flex-1 text-mist-100 placeholder:text-mist-500"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-gold-400 text-ink-950 font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mode === "signup" ? "Create account" : "Log in"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-mist-500 text-sm mt-4">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-gold-400 hover:underline"
            >
              {mode === "signup" ? "Log in" : "Create one"}
            </button>
          </p>
        </div>

        <div className="flex items-start gap-2 mt-5 text-mist-500 text-xs px-2">
          <Sparkles size={14} className="mt-0.5 shrink-0" />
          <p>
            Guest mode gives you company mock questions instantly. Sign up with email to also unlock voice input
            and resume upload &amp; correction with company matching.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
