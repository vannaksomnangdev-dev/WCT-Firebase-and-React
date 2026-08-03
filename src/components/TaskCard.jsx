export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">{task.title}</h3>

      {task.notes && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{task.notes}</p>
      )}

      <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={() => onEdit(task)}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs font-medium text-red-400 hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
