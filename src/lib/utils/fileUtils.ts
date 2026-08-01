/**
 * Download a file from a URL by fetching it as a blob and triggering a download.
 * Falls back to opening in a new tab if fetch fails.
 */
export async function handleFileDownload(fileUrl: string | undefined, fileName: string): Promise<void> {
  if (!fileUrl || fileUrl === '#') return;

  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch {
    // Fallback: open in new tab
    window.open(fileUrl, '_blank');
  }
}
