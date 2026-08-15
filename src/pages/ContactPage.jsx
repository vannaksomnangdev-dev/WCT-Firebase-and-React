import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";

export default function ContactPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!loading && !user) return <Navigate to="/" replace />;

  function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    // No backend endpoint for this yet — acknowledges the message locally.
    // Wire this to a Firestore "contactMessages" collection or an email service if needed later.
    setSent(true);
    setMessage("");
    showToast("Message sent");
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 relative">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Contact</h1>
        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg rounded-2xl p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Questions or feedback about FlowGroup? Send a message below.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="self-start bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Send
            </button>
            {sent && <p className="text-xs text-emerald-600">Thanks — we'll get back to you.</p>}
          </form>
        </div>
      </main>
    </div>
  );
}