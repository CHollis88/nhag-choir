// Google Drive share links look like:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// Google officially supports embedding a file's own preview player (audio,
// video, PDF, etc.) via an iframe at a "/preview" URL built from that same
// file ID. This is a real, documented Google feature -- unlike OneDrive's
// share links, it's designed for exactly this kind of embedding and won't
// require special server-side fetching or authentication.
export function getDriveEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (!match) return null;
  return `https://drive.google.com/file/d/${match[1]}/preview`;
}

export function isDriveLink(url) {
  return !!getDriveEmbedUrl(url);
}
