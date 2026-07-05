import React, { useRef, useState } from "react";
import { Mic, MicOff, Loader2, Lock } from "lucide-react";
import api from "../lib/api.js";

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "ta-IN", label: "Tamil" },
];

/**
 * Voice input widget.
 * - Uses the browser's built-in SpeechRecognition (webkitSpeechRecognition) to capture speech.
 * - Sends the raw transcript to the backend, which uses the Groq LLM to fix mistakes and
 *   normalise Tamil / English / Tanglish mixed speech into clean text.
 * - `locked` disables the mic for guest users (voice input is a full-account feature).
 */
export default function VoiceInput({ onResult, context = "", locked = false }) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRecognition;

  function startListening() {
    if (locked || !supported) return;
    setError("");

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onerror = (e) => {
      setListening(false);
      setError(e.error === "no-speech" ? "Didn't catch that, try again." : "Mic error. Please try again.");
    };
    recognition.onend = () => setListening(false);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setProcessing(true);
      try {
        const res = await api.post("/voice/correct", { transcript, context });
        onResult(res.data.correctedText, res.data);
      } catch (err) {
        // fall back to raw transcript if correction fails
        onResult(transcript, { correctedText: transcript, detectedLanguage: "Unknown", notes: "" });
        setError(err.response?.data?.error || "Couldn't clean up the audio, used raw text instead.");
      } finally {
        setProcessing(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  if (!supported) {
    return (
      <p className="text-xs text-mist-500">Voice input isn't supported in this browser. Try Chrome or Edge.</p>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        disabled={locked || processing}
        title={locked ? "Sign up with email to unlock voice input" : "Tap to speak"}
        className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-colors shrink-0
          ${listening ? "bg-red-500/20 text-red-400" : "bg-ink-700 text-mist-100 hover:bg-ink-600"}
          disabled:opacity-40`}
      >
        {locked ? (
          <Lock size={16} />
        ) : processing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : listening ? (
          <MicOff size={18} />
        ) : (
          <Mic size={18} />
        )}
        {listening && (
          <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
        )}
      </button>

      {!locked && (
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={listening || processing}
          className="bg-ink-900 border border-ink-700 text-mist-300 text-xs rounded-lg px-2 py-2 outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      )}

      {locked && <span className="text-xs text-mist-500">Sign up to unlock voice input</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
      {processing && <span className="text-xs text-mist-500">Cleaning up your speech…</span>}
    </div>
  );
}
