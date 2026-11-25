/**
 * Shared helpers for normalizing stored upload paths and resolving
 * public/live document URLs returned in API responses.
 */

export function getPublicFileBaseUrl(req = null) {
  const envUrl = process.env.PUBLIC_FILE_URL || process.env.SHARE_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (req && typeof req.get === 'function') {
    const host = req.get('host');
    if (host && !host.includes('localhost') && !host.startsWith('127.')) {
      const forwardedProto = req.headers?.['x-forwarded-proto'];
      const proto = forwardedProto
        ? String(forwardedProto).split(',')[0].trim()
        : 'https';
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  return 'https://steeldoorapi.ufstech.co.in';
}

export function normalizeRelativeUploadPath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return rawPath;
  const trimmed = rawPath.trim();
  if (!trimmed || trimmed.startsWith('data:')) return trimmed;

  // Strip host/origin if pointing to /uploads/... so DB keeps clean relative paths
  const uploadMatch = trimmed.match(/^https?:\/\/[^/]+(\/uploads\/.+)$/i);
  if (uploadMatch) {
    return uploadMatch[1];
  }

  // Keep unrelated external links untouched
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  let clean = trimmed.replace(/^\/+/, '');
  if (!clean.startsWith('uploads/')) {
    clean = `uploads/${clean}`;
  }
  return `/${clean}`;
}

export function toPublicFileUrl(rawPath, req = null) {
  if (!rawPath || typeof rawPath !== 'string') return '';
  const trimmed = rawPath.trim();
  if (!trimmed || trimmed.startsWith('data:')) return trimmed;

  const normalized = normalizeRelativeUploadPath(trimmed);
  const full = /^https?:\/\//i.test(normalized)
    ? normalized
    : `${getPublicFileBaseUrl(req)}${normalized}`;

  try {
    return encodeURI(decodeURI(full));
  } catch {
    return encodeURI(full);
  }
}
