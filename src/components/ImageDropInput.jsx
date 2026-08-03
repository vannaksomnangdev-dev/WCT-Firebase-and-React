import { useRef, useState } from "react";

const MAX_FILE_BYTES = 700 * 1024; // 700KB raw file size — covers most small GIFs/photos while staying safely under Firestore's 1MB document cap once base64-encoded

export default function ImageDropInput({ value, onChange, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      onError?.("That's not an image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      onError?.("Image is too large — please use one under 500KB, or paste a link instead.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.onerror = () => onError?.("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function commitUrl() {
    if (urlDraft.trim()) onChange(urlDraft.trim());
  }

  if (value) {
    return (
      <div className="relative">
        <img src={value} alt="" className="w-full max-h-56 object-cover rounded-lg" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
        }`}
      >
        <p className="text-xs text-slate-400">Drag an image here, or click to choose a file</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="…or paste an image link"
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={commitUrl}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Use
        </button>
      </div>
    </div>
  );
}