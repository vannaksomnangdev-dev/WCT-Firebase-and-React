import { useState } from "react";
import { usePolls, createPoll, castVote, deletePoll } from "../../hooks/usePolls.js";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function PollBoard({ groupId, userId, isOwner }) {
  const polls = usePolls(groupId);
  const { showToast } = useToast();
  const [question, setQuestion] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setCreating(true);
    try {
      await createPoll(groupId, userId, question.trim());
      setQuestion("");
      showToast("Poll created successfully! 📊");
    } catch {
      showToast("Couldn't create poll.", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleVote(pollId, choice) {
    try {
      await castVote(pollId, userId, choice);
    } catch {
      showToast("Couldn't record your vote.", "error");
    }
  }

  async function handleDelete(pollId) {
    try {
      await deletePoll(pollId);
      showToast("Poll deleted successfully.", "info");
    } catch {
      showToast("Couldn't delete poll.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full pb-20">
      
      {/* 📊 Interactive Poll Creation Box */}
      <form onSubmit={handleCreate} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl rounded-3xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Create a New Group Poll</h3>
        </div>
        <div className="flex gap-2.5">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask the group something interesting…"
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
          >
            {creating ? "Posting..." : "Ask Poll 🚀"}
          </button>
        </div>
      </form>

      {/* Polls List Feed */}
      <div className="flex flex-col gap-4">
        {polls.map((poll) => {
          const votes = poll.votes || {};
          const values = Object.values(votes);
          const yesCount = values.filter((v) => v === "yes").length;
          const noCount = values.filter((v) => v === "no").length;
          const total = yesCount + noCount;
          const yesPct = total ? Math.round((yesCount / total) * 100) : 0;
          const noPct = total ? 100 - yesPct : 0;
          const myVote = votes[userId];

          return (
            <div key={poll.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden">
              
              {/* Question Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 shadow-inner">
                    ❓
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {poll.question}
                  </p>
                </div>
                {(poll.authorId === userId || isOwner) && (
                  <button 
                    onClick={() => handleDelete(poll.id)} 
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete poll"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Progress Bar Breakdown */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-3 rounded-full bg-red-100 dark:bg-red-950/40 overflow-hidden p-0.5 shadow-inner flex">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-sm" 
                    style={{ width: `${yesPct}%` }} 
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-semibold px-1">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    👍 Agree ({yesCount}) · {yesPct}%
                  </span>
                  <span className="text-slate-400">
                    Total Votes: {total}
                  </span>
                  <span className="text-red-500 dark:text-red-400">
                    {noPct}% · Disagree ({noCount}) 👎
                  </span>
                </div>
              </div>

              {/* Voting Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleVote(poll.id, "yes")}
                  className={`flex-1 text-xs sm:text-sm font-bold py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    myVote === "yes" 
                      ? "bg-emerald-600 text-white shadow-emerald-500/20 ring-2 ring-emerald-400/50 scale-[1.02]" 
                      : "bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>👍</span> Agree
                </button>
                <button
                  onClick={() => handleVote(poll.id, "no")}
                  className={`flex-1 text-xs sm:text-sm font-bold py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    myVote === "no" 
                      ? "bg-red-500 text-white shadow-red-500/20 ring-2 ring-red-400/50 scale-[1.02]" 
                      : "bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>👎</span> Disagree
                </button>
              </div>

            </div>
          );
        })}

        {polls.length === 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-12 text-center shadow-lg my-4">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
              📈
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">No active polls</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Ask your group a question above to start collecting community votes and feedback!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}