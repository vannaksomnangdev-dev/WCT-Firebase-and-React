import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";

export default function AboutPage() {
  const { user, loading } = useAuth();
  if (!loading && !user) return <Navigate to="/" replace />;

  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 relative">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">About FlowGroup</h1>
        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg rounded-2xl p-6 flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            FlowGroup is a community platform for discovering and joining project groups —
            game dev teams, study groups, school projects, and more. Create a public or
            private group, share updates, run polls, and connect with people working on
            similar things.
          </p>
          <p>
            Every user gets a personal feed to share public or private posts, and every
            group gets its own space for announcements, discussion, and members.
          </p>
          <p className="text-xs text-slate-400">Built as a school project using React and Firebase.</p>
        </div>
      </main>
    </div>
  );
}