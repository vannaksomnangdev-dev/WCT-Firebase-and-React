import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { useTasks, addTask, updateTask, deleteTask } from "../hooks/useTasks.js";
import Navbar from "../components/Navbar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

const TABS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("todo");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const tasks = useTasks(user?.uid, (error) => {
    showToast(
      error.code === "permission-denied"
        ? "Permission denied — check your Firestore rules."
        : "Couldn't load tasks. See console for details.",
      "error"
    );
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  function openAddModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleModalSubmit(fields) {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, fields);
        showToast("Task updated");
      } else {
        await addTask(user.uid, fields);
        showToast("Task added");
      }
      setModalOpen(false);
    } catch (error) {
      showToast("Something went wrong saving that task.", "error");
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      showToast("Task deleted", "info");
    } catch (error) {
      showToast("Couldn't delete that task.", "error");
    }
  }

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo" || !TABS.some((tab) => tab.key === t.status)),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const visibleTasks = tasksByStatus[activeTab] || [];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Tasks</h1>
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New Task
          </button>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={openEditModal} onDelete={handleDelete} />
          ))}
        </div>

        {tasks.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-12">Nothing here yet.</p>
        )}
      </main>

      <TaskModal
        isOpen={modalOpen}
        editingTask={editingTask}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
