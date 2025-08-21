export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Regex patterns for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export function formatYouTubeEmbed(url: string): string {
  const videoId = extractYouTubeId(url);
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // If not YouTube, return the original URL
  return url;
}

export function validateVideoUrl(url: string): boolean {
  if (!url) return true; // Empty is valid (optional field)
  
  // Check if it's a valid YouTube URL or other video platforms
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) return true;
  
  // Allow other video platforms (Vimeo, etc.)
  const validPatterns = [
    /^https?:\/\/(www\.)?(vimeo\.com|dailymotion\.com|wistia\.com)/,
    /^https?:\/\/.+\.(mp4|webm|ogg)$/i // Direct video files
  ];
  
  return validPatterns.some(pattern => pattern.test(url));
}

export function getVideoThumbnail(url: string): string | null {
  const videoId = extractYouTubeId(url);
  
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  return null;
}