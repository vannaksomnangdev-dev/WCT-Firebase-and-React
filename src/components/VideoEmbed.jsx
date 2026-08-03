import { useEffect, useRef, useState } from "react";
import { getEmbedUrl } from "../utils/videoEmbed.js";

export default function VideoEmbed({ url }) {
  const embedUrl = getEmbedUrl(url);
  const isYouTube = embedUrl?.includes("youtube.com");
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [muted, setMuted] = useState(true);

  // Play when scrolled into view, pause when scrolled away — same pattern as Facebook/Instagram feeds.
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.6),
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function sendCommand(func) {
    if (!isYouTube || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  }

  useEffect(() => {
    if (!isYouTube) return;
    sendCommand(isVisible ? "playVideo" : "pauseVideo");
  }, [isVisible]);

  function toggleSound(e) {
    e.stopPropagation();
    if (!isYouTube) return;
    sendCommand(muted ? "unMute" : "mute");
    setMuted((m) => !m);
  }

  if (!embedUrl) return null;

  const src = isYouTube
    ? `${embedUrl}?enablejsapi=1&mute=1&autoplay=${isVisible ? 1 : 0}&playsinline=1`
    : `${embedUrl}?autoplay=${isVisible ? 1 : 0}&muted=1`;

  return (
    <div ref={containerRef} className="w-full mb-3 rounded-xl overflow-hidden aspect-video relative">
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded video"
      />
      {isYouTube && (
        <button
          onClick={toggleSound}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm flex items-center justify-center transition-colors"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      )}
    </div>
  );
}