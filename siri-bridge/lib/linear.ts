/**
 * Server-side Linear helpers.
 * Uses only process.env.LINEAR_API_KEY (never exposed to the device).
 *
 * TODO: Replace the stubs with real Linear GraphQL calls once
 * the Linear connector is re-authenticated and the key is confirmed.
 */

const LINEAR_API = 'https://api.linear.app/graphql';

export async function getWorkplaceStatus() {
  // Placeholder – replace with real GraphQL query
  return {
    summary:
      'OrgSuite Codex App is active. Connector checklist is mostly green. Linear connector currently requires re-authentication on the Grok side.',
    project: 'OrgSuite Codex App',
    openIssues: null,
    connectorNote: 'Re-authenticate Linear connector to enable live data',
  };
}

export async function runNaturalQuery(query: string) {
  // Placeholder – later: map natural language → Linear search / issue filters
  return {
    summary: `Query received: "${query}". Live results will appear after LINEAR_API_KEY is active and the connector is re-authenticated.`,
    query,
  };
}

export async function prepareIssue(input: {
  title: string;
  description?: string;
  priority?: number;
}) {
  // Returns a draft only. Actual creation should happen only after
  // the user confirms via Siri / Shortcuts.
  return {
    title: input.title.slice(0, 200),
    description: (input.description || '').slice(0, 4000),
    priority: input.priority ?? 3,
  };
}
