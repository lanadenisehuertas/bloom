export interface FormVideoLinks {
  youtube: string
  tiktok: string
}

/**
 * encodeURIComponent leaves a handful of characters unescaped
 * (! ' ( ) *) since they're valid in URIs, but they're not valid
 * in a YouTube/TikTok search query param, so escape those too.
 */
function strictEncodeURIComponent(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

export function buildFormVideoLinks(exerciseName: string): FormVideoLinks {
  const query = `${exerciseName} proper form woman workout`
  return {
    youtube: `https://www.youtube.com/results?search_query=${strictEncodeURIComponent(query).replace(/%20/g, '+')}`,
    tiktok: `https://www.tiktok.com/search?q=${strictEncodeURIComponent(query)}`,
  }
}
