import { createHmac } from 'node:crypto';
import { HubError } from '../errors.mjs';

const GODADDY_HEALTH = 'https://orgsuite-godaddy-health.vercel.app/api/godaddy/health';
const DEFAULT_REPOSITORY = 'pointgoddesscc-sketch/orgsuite-workspace';
const present = (value) => typeof value === 'string' && value.trim().length > 0;
const list = (value) => Array.isArray(value) ? value : [];
const text = (value, limit = 200) => typeof value === 'string' ? value.slice(0, limit) : null;
const count = (value) => Number.isSafeInteger(value) && value >= 0 ? value : null;
const decimal = (value) => typeof value === 'string' && /^\d+(\.\d+)?$/.test(value) ? value : null;

function requireValues(values) {
  if (!values.every(present)) throw new HubError(503, 'configuration_required');
}

function requireIdentifiers(values, expression, maximum = 20) {
  if (!Array.isArray(values) || !values.length) throw new HubError(503, 'configuration_required');
  if (values.length > maximum || !values.every((value) => present(value) && expression.test(value))) {
    throw new HubError(503, 'configuration_invalid');
  }
}

function resultObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HubError(502, 'provider_response_invalid');
  }
  return value;
}

function bearer(token) {
  requireValues([token]);
  if (/[\r\n]/.test(token)) throw new HubError(503, 'configuration_invalid');
  return { Authorization: `Bearer ${token}` };
}

// Provider URLs are constructed exclusively from these fixed origins and validated
// configuration identifiers. No browser-supplied URL or destination is accepted.
export function createRegistry({ config, getGoogleAccessToken, http, drive }) {
  const read = (url, options) => http.json(url, { ...options, method: 'GET' });
  const google = config.google ?? {};
  const github = config.github ?? {};
  const meta = config.meta ?? {};
  const vercel = config.vercel ?? {};
  const cloudflare = config.cloudflare ?? {};
  const repositories = github.repositories?.length ? github.repositories : [DEFAULT_REPOSITORY];
  const googleConfigured = [google.clientId, google.clientSecret].every(present);

  return [
    {
      id: 'google-drive', label: 'Google Drive',
      description: 'Files and project folders inside the explicitly selected Drive roots.',
      capabilities: ['status:read', 'files:list', 'files:search', 'files:upload', 'files:download', 'folders:create'],
      requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      configured: googleConfigured,
      async test() {
        requireValues([google.clientId, google.clientSecret]);
        return drive.status();
      },
    },
    {
      id: 'gmail', label: 'Gmail / Google Workspace',
      description: 'Mailbox profile and recent inbox identifiers, without reading message bodies or sending mail.',
      capabilities: ['status:read', 'mail:metadata'],
      requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      configured: googleConfigured,
      async test() {
        requireValues([google.clientId, google.clientSecret]);
        const headers = bearer(await getGoogleAccessToken());
        const profile = resultObject(await read('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers }));
        const inbox = resultObject(await read('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX', { headers }));
        if (!present(profile.emailAddress)) throw new HubError(502, 'provider_response_invalid');
        return {
          identity: { email: text(profile.emailAddress) },
          summary: { messagesTotal: count(profile.messagesTotal), threadsTotal: count(profile.threadsTotal) },
          activity: list(inbox.messages).slice(0, 5).map((message) => ({
            type: 'inbox_message', id: text(message.id), threadId: text(message.threadId),
          })),
        };
      },
    },
    {
      id: 'github', label: 'GitHub',
      description: 'Authenticated identity, allowlisted repository metadata, and recent commits.',
      capabilities: ['status:read', 'repositories:read', 'commits:read'],
      setupUrl: 'https://github.com/settings/personal-access-tokens',
      requiredEnv: ['GITHUB_TOKEN'],
      configured: present(github.token),
      async test() {
        requireValues([github.token]);
        requireIdentifiers(repositories, /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/);
        if (repositories.some((repository) => ['.', '..'].includes(repository.split('/')[1]))) throw new HubError(503, 'configuration_invalid');
        const headers = {
          ...bearer(github.token), Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'OrgSuite-Connector-Hub',
        };
        const user = resultObject(await read('https://api.github.com/user', { headers }));
        if (!present(user.login)) throw new HubError(502, 'provider_response_invalid');
        const summaries = [];
        const activity = [];
        for (const repository of repositories) {
          const url = `https://api.github.com/repos/${repository}`;
          const item = resultObject(await read(url, { headers }));
          if (item.full_name?.toLowerCase() !== repository.toLowerCase()) throw new HubError(502, 'provider_response_invalid');
          const commits = await read(`${url}/commits?per_page=3`, { headers });
          if (!Array.isArray(commits)) throw new HubError(502, 'provider_response_invalid');
          summaries.push({
            repository, private: item.private === true, defaultBranch: text(item.default_branch),
            openIssues: count(item.open_issues_count), updatedAt: text(item.updated_at),
            url: `https://github.com/${repository}`,
          });
          for (const commit of commits.slice(0, 3)) {
            activity.push({ type: 'commit', repository, sha: text(commit.sha, 64),
              author: text(commit.author?.login), at: text(commit.commit?.committer?.date) });
          }
        }
        return { identity: { login: text(user.login) }, summary: { repositories: summaries }, activity };
      },
    },
    {
      id: 'meta', label: 'Meta / Facebook Ads',
      description: 'Read-only ad account status and last seven days of account metrics. No campaign creation or spend controls.',
      capabilities: ['status:read', 'ads:read'],
      setupUrl: 'https://business.facebook.com/settings/ad-accounts',
      requiredEnv: ['META_ACCESS_TOKEN', 'META_APP_ID', 'META_APP_SECRET', 'META_AD_ACCOUNT_ID', 'META_API_VERSION'],
      configured: [meta.token, meta.appId, meta.appSecret, meta.adAccountId, meta.version].every(present),
      async test() {
        requireValues([meta.token, meta.appId, meta.appSecret, meta.adAccountId, meta.version]);
        if (!/^\d{1,30}$/.test(meta.appId) || !/^(act_)?\d{1,30}$/.test(meta.adAccountId) || !/^v\d{1,3}\.\d{1,2}$/.test(meta.version)) {
          throw new HubError(503, 'configuration_invalid');
        }
        const accountId = meta.adAccountId.startsWith('act_') ? meta.adAccountId : `act_${meta.adAccountId}`;
        const proof = createHmac('sha256', meta.appSecret).update(meta.token).digest('hex');
        const base = `https://graph.facebook.com/${meta.version}/${accountId}`;
        const headers = bearer(meta.token);
        const accountQuery = new URLSearchParams({ fields: 'id,name,account_status,currency,timezone_name', appsecret_proof: proof });
        const insightsQuery = new URLSearchParams({
          fields: 'impressions,clicks,spend', date_preset: 'last_7d', level: 'account', limit: '1', appsecret_proof: proof,
        });
        const account = resultObject(await read(`${base}?${accountQuery}`, { headers }));
        const insights = resultObject(await read(`${base}/insights?${insightsQuery}`, { headers }));
        if (account.id !== accountId || !Array.isArray(insights.data)) throw new HubError(502, 'provider_response_invalid');
        const metrics = insights.data[0] ?? {};
        return {
          identity: { accountId, name: text(account.name) },
          summary: {
            accountStatus: count(account.account_status), currency: text(account.currency, 10),
            timezone: text(account.timezone_name), datePreset: 'last_7d',
            impressions: decimal(metrics.impressions), clicks: decimal(metrics.clicks), spend: decimal(metrics.spend),
          },
          activity: [],
        };
      },
    },
    {
      id: 'vercel', label: 'Vercel',
      description: 'Configured projects and their most recent deployments.',
      capabilities: ['status:read', 'projects:read', 'deployments:read'],
      setupUrl: 'https://vercel.com/account/tokens',
      requiredEnv: ['VERCEL_TOKEN', 'HUB_VERCEL_PROJECT_IDS'],
      configured: present(vercel.token) && list(vercel.projectIds).length > 0,
      async test() {
        requireValues([vercel.token]);
        requireIdentifiers(vercel.projectIds, /^[A-Za-z0-9_-]{1,100}$/);
        if (vercel.teamId && !/^[A-Za-z0-9_-]{1,100}$/.test(vercel.teamId)) throw new HubError(503, 'configuration_invalid');
        const headers = bearer(vercel.token);
        const summaries = [];
        const activity = [];
        for (const projectId of vercel.projectIds) {
          const query = new URLSearchParams(vercel.teamId ? { teamId: vercel.teamId } : {});
          const suffix = query.size ? `?${query}` : '';
          const project = resultObject(await read(`https://api.vercel.com/v9/projects/${projectId}${suffix}`, { headers }));
          if (project.id !== projectId) throw new HubError(502, 'provider_response_invalid');
          query.set('projectId', projectId); query.set('limit', '3');
          const recent = resultObject(await read(`https://api.vercel.com/v6/deployments?${query}`, { headers }));
          if (!Array.isArray(recent.deployments)) throw new HubError(502, 'provider_response_invalid');
          summaries.push({ id: text(project.id), name: text(project.name), framework: text(project.framework) });
          for (const deployment of recent.deployments.slice(0, 3)) {
            activity.push({ type: 'deployment', projectId, id: text(deployment.uid),
              state: text(deployment.state ?? deployment.readyState), createdAt: count(deployment.createdAt ?? deployment.created) });
          }
        }
        return { identity: { teamId: text(vercel.teamId) }, summary: { projects: summaries }, activity };
      },
    },
    {
      id: 'cloudflare', label: 'Cloudflare',
      description: 'Token validity and selected zone health. No DNS or zone changes.',
      capabilities: ['status:read', 'zones:read'],
      setupUrl: 'https://dash.cloudflare.com/profile/api-tokens',
      requiredEnv: ['CLOUDFLARE_API_TOKEN', 'HUB_CLOUDFLARE_ZONE_IDS'],
      configured: present(cloudflare.token) && list(cloudflare.zoneIds).length > 0,
      async test() {
        requireValues([cloudflare.token]);
        requireIdentifiers(cloudflare.zoneIds, /^[A-Fa-f0-9]{32}$/);
        const headers = bearer(cloudflare.token);
        const verification = resultObject(await read('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers }));
        if (verification.success !== true || verification.result?.status !== 'active') {
          throw new HubError(401, 'authorization_required');
        }
        const zones = [];
        for (const zoneId of cloudflare.zoneIds) {
          const response = resultObject(await read(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, { headers }));
          if (response.success !== true || response.result?.id !== zoneId) throw new HubError(502, 'provider_response_invalid');
          zones.push({ id: zoneId, name: text(response.result.name), status: text(response.result.status), paused: response.result.paused === true });
        }
        return { identity: { tokenStatus: 'active' }, summary: { zones }, activity: [] };
      },
    },
    {
      id: 'godaddy', label: 'GoDaddy health',
      description: 'Public reachability and readiness only. A successful health response does not verify GoDaddy account ownership or DNS access.',
      capabilities: ['health:read'],
      setupUrl: 'https://developer.godaddy.com/keys',
      requiredEnv: [], configured: true,
      async test() {
        const response = await http.probe(GODADDY_HEALTH);
        return {
          identity: { verification: 'health_only' },
          summary: { verification: 'health_only', httpStatus: count(response.status),
            reachable: response.status >= 100 && response.status < 600,
            ready: response.status >= 200 && response.status < 300 && response.body?.ok === true,
            accountAccessVerified: false },
          activity: [],
        };
      },
    },
  ];
}
