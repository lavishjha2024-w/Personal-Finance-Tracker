const rawApiUrl = (process.env.REACT_APP_API_URL || '').trim();
const isBrowser = typeof window !== 'undefined';
const isLocalhostEnv =
  isBrowser &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Avoid accidentally pointing production builds at localhost.
let resolvedApiUrl = rawApiUrl || (isLocalhostEnv ? 'http://localhost:5000' : '');

// Prevent mixed-content issues if the app is served over HTTPS.
if (isBrowser && window.location.protocol === 'https:' && resolvedApiUrl.startsWith('http://')) {
  resolvedApiUrl = resolvedApiUrl.replace(/^http:\/\//i, 'https://');
}

export const API_BASE_URL = resolvedApiUrl.replace(/\/+$/, '');
