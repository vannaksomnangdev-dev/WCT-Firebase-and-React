import React from "react";
import { Link } from "react-router-dom";

export function renderFormattedText(text) {
  if (!text) return null;

  // Regex to match URLs and @usernames
  const regex = /(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // If it's a URL
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-500 hover:underline break-all"
        >
          {part}
        </a>
      );
    }

    // If it's an @mention
    if (part.startsWith("@")) {
      const username = part.slice(1); // remove @
      return (
        <Link
          key={index}
          to={`/user/${username}`}
          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline bg-emerald-500/10 px-1 py-0.5 rounded"
        >
          {part}
        </Link>
      );
    }

    return part;
  });
}