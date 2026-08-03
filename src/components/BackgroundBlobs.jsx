import { useMemo } from "react";

const COLOR_SETS = [
  ["bg-emerald-400/20 dark:bg-emerald-500/10", "bg-sky-400/20 dark:bg-sky-500/10", "bg-amber-400/10 dark:bg-amber-500/10"],
  ["bg-violet-400/20 dark:bg-violet-500/10", "bg-emerald-400/15 dark:bg-emerald-500/10", "bg-rose-400/10 dark:bg-rose-500/10"],
  ["bg-sky-400/20 dark:bg-sky-500/10", "bg-amber-400/15 dark:bg-amber-500/10", "bg-fuchsia-400/10 dark:bg-fuchsia-500/10"],
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function BackgroundBlobs() {
  // Randomized once per page load — positions, sizes, and animation timing vary each visit,
  // but nothing recalculates after mount, so there's no ongoing cost.
  const blobs = useMemo(() => {
    const colors = COLOR_SETS[Math.floor(Math.random() * COLOR_SETS.length)];
    return colors.map((color, i) => ({
      color,
      size: rand(280, 420),
      top: rand(-10, 90),
      left: rand(-15, 85),
      duration: rand(18, 30),
      delay: rand(0, 6),
      reverse: i % 2 === 1,
    }));
  }, []);

  return (
    // Fixed (not absolute) so it always covers the full viewport regardless of page length or scroll —
    // one shared instance handles every page, short or long, without stretching or cutting off.
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl ${b.color}`}
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            top: `${b.top}vh`,
            left: `${b.left}vw`,
            animation: `drift ${b.duration}s ease-in-out infinite ${b.reverse ? "reverse" : ""}`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}