import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function list(value, fallback = []) {
  if (!value) return fallback;
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('Configuration lists must be JSON arrays');
  return parsed;
}

export function loadConfig(env = process.env) {
  const development = env.NODE_ENV === 'development';
  const origin = new URL(env.HUB_ORIGIN || 'http://127.0.0.1:4310');
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname);
  if (origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash ||
      (origin.protocol !== 'https:' && !(development && loopback && origin.protocol === 'http:'))) {
    throw new Error('HUB_ORIGIN must be an HTTPS origin; loopback HTTP is development only');
  }
  if (!env.HUB_OWNER_ID || !env.HUB_LOGIN_SECRET || env.HUB_LOGIN_SECRET.length < 32 ||
      !env.HUB_VAULT_KEY || Buffer.from(env.HUB_VAULT_KEY, 'base64').length !== 32) {
    throw new Error('Set HUB_OWNER_ID, a strong HUB_LOGIN_SECRET and a 32-byte base64 HUB_VAULT_KEY');
  }
  if (!env.HUB_DATA_DIR || !path.isAbsolute(env.HUB_DATA_DIR)) throw new Error('HUB_DATA_DIR must be an absolute private storage directory');
  const dataDir = path.resolve(env.HUB_DATA_DIR);
  const relative = path.relative(repository, dataDir);
  if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('HUB_DATA_DIR must be outside the repository and web root');
  }
  if (env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME || (!development && env.HUB_PERSISTENT_STORAGE !== '1')) {
    throw new Error('Hub requires one Node process on a host with an explicitly provisioned persistent volume');
  }
  const port = Number(env.PORT || 4310);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const driveScope = env.HUB_GOOGLE_DRIVE_SCOPE || 'https://www.googleapis.com/auth/drive.file';
  if (!['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive'].includes(driveScope)) {
    throw new Error('Unsupported Google Drive scope');
  }
  const driveRoots = list(env.HUB_DRIVE_ROOTS);
  for (const root of driveRoots) {
    if (!root || typeof root.id !== 'string' || !/^[A-Za-z0-9_-]{3,200}$/.test(root.id) ||
        (root.driveId && !/^[A-Za-z0-9_-]{3,200}$/.test(root.driveId))) throw new Error('Invalid approved Drive root');
  }
  return {
    origin: origin.origin, development, secureCookies: origin.protocol === 'https:',
    host: env.HUB_LISTEN_HOST || '127.0.0.1', port, ownerId: env.HUB_OWNER_ID,
    loginSecret: env.HUB_LOGIN_SECRET, vaultKey: Buffer.from(env.HUB_VAULT_KEY, 'base64'), dataDir,
    inquiryIngestKey: env.ORGSUITE_INQUIRY_INGEST_KEY || '',
    google: { clientId: env.GOOGLE_CLIENT_ID || '', clientSecret: env.GOOGLE_CLIENT_SECRET || '', accountEmail: env.HUB_GOOGLE_ACCOUNT_EMAIL || '', driveScope },
    driveRoots, maxFileBytes: 5 * 1024 * 1024,
    github: { token: env.GITHUB_TOKEN || '', repositories: list(env.HUB_GITHUB_REPOSITORIES, ['pointgoddesscc-sketch/orgsuite-workspace']) },
    meta: { token: env.META_ACCESS_TOKEN || '', appId: env.META_APP_ID || '', appSecret: env.META_APP_SECRET || '', adAccountId: env.META_AD_ACCOUNT_ID || '', version: env.META_API_VERSION || '' },
    vercel: { token: env.VERCEL_TOKEN || '', teamId: env.VERCEL_TEAM_ID || '', projectIds: list(env.HUB_VERCEL_PROJECT_IDS) },
    cloudflare: { token: env.CLOUDFLARE_API_TOKEN || '', zoneIds: list(env.HUB_CLOUDFLARE_ZONE_IDS) }
  };
}
