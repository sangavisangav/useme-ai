import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { getSession } from "./lib/api.js";

export default function App() {
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    // keep session in sync if it changes in another tab
    const handler = () => setSession(getSession());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          session ? <Navigate to="/app" replace /> : <LoginPage onLogin={setSession} />
        }
      />
      <Route
        path="/app"
        element={
          session ? (
            <Dashboard session={session} onLogout={() => setSession(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
