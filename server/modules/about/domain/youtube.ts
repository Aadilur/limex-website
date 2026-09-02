const acceptedYouTubeHosts = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
]);

const videoIdPattern = /^[a-zA-Z0-9_-]{6,32}$/;

export function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!acceptedYouTubeHosts.has(hostname)) return null;

    let videoId = "";
    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") ?? "";
    } else {
      const segments = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(segments[0] ?? "")) videoId = segments[1] ?? "";
    }

    return videoIdPattern.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function normalizeYouTubeUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    controls: "1",
    enablejsapi: "1",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
