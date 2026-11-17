/** Keep links and image URLs working locally and below the GitHub Pages base. */
export function withBase(path: string) {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
