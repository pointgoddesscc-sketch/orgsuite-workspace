const actions = {
  codex: () => window.open('https://chatgpt.com/codex', '_blank', 'noopener,noreferrer'),
  files: () => alert('Repository file inspection is ready to be wired to the authenticated server endpoint.'),
  branches: () => alert('Branch management is ready to be wired to the authenticated server endpoint.'),
  pulls: () => alert('Pull-request review is ready to be wired to the authenticated server endpoint.'),
  linear: () => window.open('https://linear.app/pse-management/issue/PSE-16/connect-godaddy-secure-automation-full-orgsuite-connectors-to-codex', '_blank', 'noopener,noreferrer')
};

document.querySelectorAll('[data-action]').forEach(el =>
  el.addEventListener('click', () => actions[el.dataset.action]?.())
);

// Placeholder for future server-fed status (never hardcode secrets)
console.info('[OrgSuite] Command Center loaded – GoDaddy + full connector status surface ready.');
