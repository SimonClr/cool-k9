import { UserDataExport } from '@models';

/** Filename carries the export date, so successive exports do not overwrite each other. */
export function buildExportFileName(exportedAt: string): string {
  const day = exportedAt.slice(0, 10);
  return `cool-k9-mes-donnees-${day}.json`;
}

/**
 * Hands the export to the browser as a downloadable file. The object URL is
 * revoked afterwards, otherwise the blob stays in memory for the page's lifetime.
 */
export function downloadDataExport(data: UserDataExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = buildExportFileName(data.exportedAt);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
