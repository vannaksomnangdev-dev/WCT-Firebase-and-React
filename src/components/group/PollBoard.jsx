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
    } catch {
      showToast("Couldn't delete poll.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the group something…"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Ask
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {polls.map((poll) => {
          const votes = poll.votes || {};
          const values = Object.values(votes);
          const yesCount = values.filter((v) => v === "yes").length;
          const noCount = values.filter((v) => v === "no").length;
          const total = yesCount + noCount;
          const yesPct = total ? Math.round((yesCount / total) * 100) : 0;
          const myVote = votes[userId];

          return (
            <div key={poll.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-3">{poll.question}</p>

              <div className="w-full h-2 rounded-full bg-red-200 dark:bg-red-900/40 overflow-hidden mb-2">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${yesPct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-3">
                <span>Agree {yesCount}</span>
                <span>Disagree {noCount}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleVote(poll.id, "yes")}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                    myVote === "yes" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Agree
                </button>
                <button
                  onClick={() => handleVote(poll.id, "no")}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                    myVote === "no" ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Disagree
                </button>
              </div>

              {(poll.authorId === userId || isOwner) && (
                <button onClick={() => handleDelete(poll.id)} className="text-[11px] text-red-400 hover:text-red-500 mt-3">
                  Delete poll
                </button>
              )}
            </div>
          );
        })}
        {polls.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-8">No polls yet — ask the group something.</p>
        )}
      </div>
    </div>
  );
}