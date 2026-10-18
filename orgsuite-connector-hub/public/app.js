'use strict';

(() => {
  const page = document.body.dataset.page;
  const state = {
    csrfToken: '', connectors: [], roots: [], path: [], files: [], nextPageToken: null,
    driveReady: false, driveBusy: false, readOnlyDrive: true, refreshBusy: false, driveGeneration: 0,
  };
  const positiveStates = new Set(['connected']);
  const warningStates = new Set(['not_configured', 'not-connected', 'disconnected', 'requires_authorization', 'authorization_required', 'reauth_required', 'setup_required', 'pending', 'unknown', 'not_checked', 'unverified', 'stale', 'available', 'ready to configure', 'requires authorization']);
  const approvedTypes = new Map([
    ['application/pdf', ['pdf']], ['text/plain', ['txt']], ['text/csv', ['csv']], ['application/json', ['json']],
    ['image/png', ['png']], ['image/jpeg', ['jpg', 'jpeg']], ['image/webp', ['webp']],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['docx']],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ['xlsx']],
    ['application/vnd.openxmlformats-officedocument.presentationml.presentation', ['pptx']],
  ]);
  const exportTypes = new Map([
    ['application/vnd.google-apps.document', [['PDF', 'application/pdf'], ['Text', 'text/plain'], ['DOCX', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]],
    ['application/vnd.google-apps.spreadsheet', [['PDF', 'application/pdf'], ['CSV', 'text/csv'], ['XLSX', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]],
    ['application/vnd.google-apps.presentation', [['PDF', 'application/pdf'], ['PPTX', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']]],
  ]);
  const providerHosts = ['accounts.google.com', 'github.com', 'business.facebook.com', 'www.facebook.com', 'facebook.com', 'developers.facebook.com', 'app.metricool.com', 'onboard.windsor.ai', 'windsor.ai', 'www.godaddy.com', 'developer.godaddy.com', 'sso.godaddy.com', 'account.godaddy.com', 'productivity.godaddy.com', 'vercel.com', 'dash.cloudflare.com', 'console.cloud.google.com', 'ads.google.com'];
  const $ = (id) => document.getElementById(id);
  const text = (value, fallback = '') => typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = text(content);
    return node;
  };
  const friendly = (value) => text(value, 'unknown').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (char) => char.toUpperCase());
  const timestamp = (value, empty = 'Not checked') => {
    if (!value) return empty;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? empty : date.toLocaleString(undefined, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
  };
  const badge = (value) => {
    const normalized = text(value, 'unknown').toLowerCase();
    return el('span', `status-badge ${positiveStates.has(normalized) || normalized === 'success' || normalized === 'reachable' ? 'good' : warningStates.has(normalized) ? 'warn' : ['error', 'failed', 'failure', 'unhealthy', 'unavailable', 'degraded', 'denied'].includes(normalized) ? 'bad' : ''}`, friendly(normalized));
  };
  function message(content, error = false) {
    const node = $('global-message');
    node.textContent = content;
    node.classList.toggle('error', error);
    node.hidden = !content;
  }
  function driveMessage(content, error = false) {
    const node = $('drive-message');
    if (!node) return;
    node.textContent = content;
    node.classList.toggle('error', error);
  }
  function safeUrl(value, providerOnly = false) {
    try {
      const url = new URL(value, location.origin);
      if (url.username || url.password) return null;
      if (url.origin === location.origin && url.pathname.startsWith('/')) return url.href;
      if (url.protocol !== 'https:') return null;
      if (providerOnly && !providerHosts.includes(url.hostname)) return null;
      return url.href;
    } catch { return null; }
  }
  function externalLink(label, value, className, providerOnly = true) {
    const href = safeUrl(value, providerOnly);
    if (!href) return null;
    const anchor = el('a', className, label);
    anchor.href = href;
    if (new URL(href).origin !== location.origin) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    return anchor;
  }
  function rowMessage(id, columns, content) {
    const row = el('tr');
    const cell = el('td', 'empty-state', content);
    cell.colSpan = columns;
    row.append(cell);
    $(id)?.replaceChildren(row);
  }
  async function api(path, {method = 'GET', body, ...options} = {}) {
    const headers = {Accept: 'application/json'};
    if (method !== 'GET') headers['X-CSRF-Token'] = state.csrfToken;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(path, {
      ...options, method, credentials: 'same-origin', cache: 'no-store', headers,
      ...(body !== undefined ? {body: JSON.stringify(body)} : {}),
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('The Hub returned an unexpected response. Please retry.'); }
    if (!response.ok) {
      const detail = typeof result.error === 'object' ? result.error?.message : result.error;
      const code = text(result.code || (typeof result.error === 'object' ? result.error?.code : result.error));
      if (response.status === 401 && (path === '/api/session' || /session|authentication_required|unauthenticated/.test(code))) {
        location.replace('/login');
        throw new Error('Your session expired. Sign in again to continue.');
      }
      throw new Error(friendly(text(detail || result.message, `Request failed (HTTP ${response.status}).`)));
    }
    return result;
  }
  async function withButton(button, task, busyLabel = 'Working…') {
    const label = button.textContent;
    button.disabled = true;
    button.textContent = busyLabel;
    try { await task(); } catch (error) { message(error.message || 'The request failed. Please retry.', true); }
    finally {
      if (button.isConnected) {
        button.disabled = false;
        button.textContent = label;
      }
    }
  }
  function actionButton(label, task, className = 'button secondary') {
    const button = el('button', className, label);
    button.type = 'button';
    button.addEventListener('click', () => withButton(button, task));
    return button;
  }
  function identityText(identity) {
    if (typeof identity === 'string') return identity;
    if (!identity || typeof identity !== 'object') return '';
    return text(identity.email || identity.login || identity.name || identity.id);
  }
  function updateCounts() {
    const connected = state.connectors.filter((connector) => positiveStates.has(text(connector.state).toLowerCase())).length;
    $('connected-count').textContent = String(connected);
    $('attention-count').textContent = String(state.connectors.length - connected);
  }
  function renderConnectors() {
    const grid = $('connectors');
    if (!state.connectors.length) {
      grid.replaceChildren(el('p', 'empty-state', 'No connectors are registered. Configure the Hub server to add official provider adapters.'));
      updateCounts();
      return;
    }
    const icons = {'google-drive': 'GD', drive: 'GD', gmail: 'GM', github: 'GH', meta: 'M', facebook: 'M', vercel: 'V', cloudflare: 'CF', godaddy: 'Go', 'google-ads': 'Ads'};
    const cards = state.connectors.map((connector) => {
      const card = el('article', 'connector-card');
      const top = el('div', 'connector-top');
      const icon = el('span', 'connector-icon', icons[connector.id] || text(connector.label).slice(0, 2).toUpperCase());
      icon.setAttribute('aria-hidden', 'true');
      const heading = el('div');
      heading.append(el('h3', '', connector.label || friendly(connector.id)));
      top.append(icon, heading);
      card.append(top, el('p', 'connector-description', connector.description || 'Official workplace connector.'), badge(connector.state));
      const identity = identityText(connector.identity);
      if (identity) card.append(el('p', 'connector-identity', identity));
      if (connector.detail) card.append(el('p', 'connector-detail', connector.detail));
      if (typeof connector.summary === 'string') card.append(el('p', 'connector-detail', connector.summary));
      else if (connector.summary && typeof connector.summary === 'object') {
        const entries = Object.entries(connector.summary).filter(([, value]) => ['string', 'number'].includes(typeof value));
        if (entries.length) card.append(el('p', 'connector-detail', entries.map(([key, value]) => `${friendly(key)}: ${value}`).join(' · ')));
        const summaries = el('ul', 'connector-activity');
        for (const [key, values] of Object.entries(connector.summary)) {
          if (!Array.isArray(values)) continue;
          for (const item of values.slice(0, 5)) {
            if (!item || typeof item !== 'object') continue;
            const label = text(item.repository || item.name || item.id);
            const status = item.status || item.framework || item.defaultBranch;
            if (label) summaries.append(el('li', '', `${friendly(key)}: ${label}${status ? ` · ${text(status)}` : ''}`));
          }
        }
        if (summaries.children.length) card.append(summaries);
      }
      if (Array.isArray(connector.capabilities) && connector.capabilities.length) {
        const capabilities = el('div', 'capabilities');
        for (const capability of connector.capabilities) capabilities.append(el('span', 'capability', friendly(capability)));
        card.append(capabilities);
      }
      if (Array.isArray(connector.activity) && connector.activity.length) {
        const recent = el('ul', 'connector-activity');
        for (const item of connector.activity.slice(0, 3)) {
          let label = typeof item === 'string' ? item : text(item.title || item.label || item.name || item.action || item.message);
          if (!label && item && typeof item === 'object') {
            if (item.type === 'commit') label = `Commit ${text(item.sha).slice(0, 7)}${item.repository ? ` · ${text(item.repository)}` : ''}${item.at ? ` · ${timestamp(item.at)}` : ''}`;
            else if (item.type === 'deployment') label = `Deployment ${text(item.id)}${item.state ? ` · ${friendly(item.state)}` : ''}${item.createdAt ? ` · ${timestamp(item.createdAt)}` : ''}`;
            else if (item.type === 'inbox_message') label = `Inbox message ${text(item.id)} (metadata only)`;
          }
          if (label) recent.append(el('li', '', label));
        }
        if (recent.children.length) card.append(recent);
      }
      card.append(el('p', 'connector-meta', `Last checked: ${timestamp(connector.checkedAt)}`));
      const controls = el('div', 'connector-controls');
      controls.append(actionButton('Test connection', async () => {
        try {
          await api(`/api/connectors/${encodeURIComponent(connector.id)}/test`, {method: 'POST'});
          message(`${connector.label || friendly(connector.id)} check completed. Review its reported status.`);
        } finally {
          await loadConnectors().catch(() => {});
          await loadAudit();
          if (page === 'dashboard' && /drive|google/i.test(connector.id)) await loadDriveRoots();
        }
      }));
      const needsReauth = /auth|expired/i.test(text(connector.state));
      controls.append(actionButton(needsReauth ? 'Re-authenticate' : 'Connect / setup', async () => {
        const result = await api(`/api/connectors/${encodeURIComponent(connector.id)}/connect`, {method: 'POST'});
        const url = safeUrl(result.url, true);
        if (!url || !['oauth', 'external-setup'].includes(result.kind)) throw new Error('A supported provider setup link is unavailable. Review the connector configuration guide.');
        if (result.kind === 'oauth') { location.assign(url); return; }
        const note = el('p', 'setup-note', 'Continue in the official provider settings. Completing setup there does not automatically verify this connection. ');
        const link = externalLink('Open provider setup ↗', url, 'document-link');
        if (link) note.append(link);
        if (Array.isArray(result.requiredEnv) && result.requiredEnv.length) note.append(document.createTextNode(` Server configuration required: ${result.requiredEnv.map((item) => text(item)).filter(Boolean).join(', ')}.`));
        card.querySelector('.setup-note')?.remove();
        card.append(note);
        message('The official setup link is ready. Return here and test after the administrator authorizes access.');
        await loadAudit();
      }, 'button primary'));
      if (/^(google-drive|gmail)$/.test(connector.id)) {
        controls.append(actionButton('Disconnect Google', async () => {
          try {
            await api(`/api/connectors/${encodeURIComponent(connector.id)}/disconnect`, {method: 'POST'});
            message('The Hub’s stored Google authorization has been removed.');
          } finally {
            await loadConnectors().catch(() => {});
            if (page === 'dashboard') await loadDriveRoots();
            await loadAudit();
          }
        }, 'button danger'));
      }
      card.append(controls);
      return card;
    });
    grid.replaceChildren(...cards);
    updateCounts();
  }
  async function loadConnectors() {
    try {
      const result = await api('/api/connectors');
      if (!Array.isArray(result.connectors)) throw new Error('Connector data was not returned by the Hub.');
      state.connectors = result.connectors;
      state.readOnlyDrive = result.readOnlyDrive !== false;
      if (page === 'dashboard') setDriveControls();
      renderConnectors();
    } catch (error) {
      state.readOnlyDrive = true;
      if (page === 'dashboard') setDriveControls();
      $('connectors').replaceChildren(el('p', 'empty-state', `Connector status unavailable: ${error.message}`));
      $('connected-count').textContent = '—';
      $('attention-count').textContent = '—';
      throw error;
    }
  }
  async function loadAudit() {
    try {
      const result = await api('/api/audit');
      const events = Array.isArray(result.events) ? result.events : [];
      if (!events.length) { rowMessage('audit-events', 3, 'No connection events have been recorded yet.'); return; }
      const rows = events.slice(0, 30).map((event) => {
        const row = el('tr');
        const name = el('td');
        name.append(el('span', '', `${friendly(event.action)} · ${text(event.connector, 'Hub')}`), el('span', 'table-secondary', text(event.actor, 'Unknown actor')));
        const outcome = el('td');
        outcome.append(badge(event.outcome));
        if (event.code) outcome.append(el('span', 'table-secondary', event.code));
        row.append(name, outcome, el('td', 'muted', timestamp(event.createdAt, 'Time unavailable')));
        return row;
      });
      $('audit-events').replaceChildren(...rows);
    } catch (error) { rowMessage('audit-events', 3, `Activity unavailable: ${error.message}`); }
  }
  async function loadServices(test = false) {
    if (!$('services')) return;
    try {
      const result = await api(test ? '/api/services/test' : '/api/services', test ? {method: 'POST'} : {});
      const services = Array.isArray(result.services) ? result.services : [];
      if (!services.length) { rowMessage('services', 4, 'No service destinations are configured for health checks.'); return; }
      const rows = services.map((service) => {
        const row = el('tr');
        const name = el('td');
        const link = externalLink(service.label || service.id || 'Service', service.url, 'service-link', false);
        name.append(link || el('span', '', service.label || service.id || 'Service'));
        if (link) name.append(el('span', 'service-url', new URL(link.href).origin + new URL(link.href).pathname));
        const status = el('td');
        status.append(badge(service.state));
        row.append(name, status, el('td', 'muted', service.status || '—'), el('td', 'muted', timestamp(service.checkedAt)));
        return row;
      });
      $('services').replaceChildren(...rows);
    } catch (error) { rowMessage('services', 4, `Service health unavailable: ${error.message}`); }
  }
  function setDriveControls() {
    const canBrowse = state.driveReady && state.path.length > 0 && !state.driveBusy;
    for (const id of ['drive-search', 'drive-create', 'drive-upload']) {
      const enabled = canBrowse && (id === 'drive-search' || !state.readOnlyDrive);
      for (const field of $(id)?.querySelectorAll('button, input, select') || []) field.disabled = !enabled;
    }
    $('drive-root').disabled = !state.roots.length || state.driveBusy;
    $('drive-more').disabled = state.driveBusy;
  }
  function resetDrive() {
    state.driveGeneration++;
    state.roots = [];
    state.path = [];
    state.files = [];
    state.nextPageToken = null;
    state.driveReady = false;
    state.driveBusy = false;
    $('drive-root').replaceChildren(new Option('Choose an approved folder', ''));
    $('folder-path').replaceChildren();
    $('drive-more').hidden = true;
    rowMessage('drive-files', 4, 'Connect Google Drive and choose an approved root to view files.');
    setDriveControls();
  }
  async function loadDriveRoots() {
    if (page !== 'dashboard') return;
    const previousRoot = state.path[0]?.id;
    resetDrive();
    const generation = state.driveGeneration;
    try {
      const result = await api('/api/drive/roots');
      if (generation !== state.driveGeneration) return;
      state.roots = Array.isArray(result.folders) ? result.folders.filter((folder) => folder && typeof folder.id === 'string') : [];
      if (!state.roots.length) {
        driveMessage('No approved roots are configured. An administrator must authorize Drive and select folders before file access is available.');
        return;
      }
      state.driveReady = true;
      for (const folder of state.roots) $('drive-root').append(new Option(folder.name || folder.id, folder.id));
      const selected = state.roots.find((folder) => folder.id === previousRoot) || state.roots[0];
      $('drive-root').value = selected.id;
      state.path = [selected];
      setDriveControls();
      await loadFiles();
    } catch (error) {
      if (generation === state.driveGeneration) {
        driveMessage(`Drive is not ready: ${error.message}`, true);
        rowMessage('drive-files', 4, 'File access is unavailable until Google authorization and approved roots are configured.');
      }
    }
  }
  function renderPath() {
    const nodes = [];
    state.path.forEach((folder, index) => {
      if (index) nodes.push(el('span', '', '/'));
      const button = actionButton(folder.name || folder.id, async () => {
        if (state.driveBusy) return;
        state.path = state.path.slice(0, index + 1);
        $('drive-query').value = '';
        await loadFiles();
      }, 'text-button');
      if (index === state.path.length - 1) button.setAttribute('aria-current', 'location');
      nodes.push(button);
    });
    $('folder-path').replaceChildren(...nodes);
  }
  function downloadLink(file, exportMimeType) {
    const params = new URLSearchParams({fileId: file.id});
    if (exportMimeType) params.set('exportMimeType', exportMimeType);
    const anchor = el('a', 'document-link', exportMimeType ? 'Export' : 'Download');
    anchor.href = `/api/drive/download?${params}`;
    anchor.download = '';
    return anchor;
  }
  function renderFiles() {
    renderPath();
    if (!state.files.length) { rowMessage('drive-files', 4, 'No files found in this folder. Try a different search or upload an approved file.'); }
    else {
      const rows = state.files.map((file) => {
        const row = el('tr');
        const nameCell = el('td');
        const name = el('div', 'file-name');
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        const glyph = el('span', 'file-glyph', isFolder ? '▱' : '▤');
        glyph.setAttribute('aria-hidden', 'true');
        name.append(glyph, el('span', '', file.name || 'Untitled'));
        nameCell.append(name);
        const type = isFolder ? 'Folder' : text(file.mimeType).split('/').pop()?.replace('vnd.google-apps.', 'Google ') || 'File';
        const actions = el('div', 'file-actions');
        if (isFolder) actions.append(actionButton('Open folder', async () => {
          if (state.driveBusy) return;
          state.path.push({id: file.id, name: file.name});
          $('drive-query').value = '';
          await loadFiles();
        }, 'text-button'));
        else if (approvedTypes.has(file.mimeType)) actions.append(downloadLink(file));
        else if (exportTypes.has(file.mimeType)) {
          const formats = exportTypes.get(file.mimeType);
          const select = el('select');
          select.setAttribute('aria-label', `Export format for ${text(file.name, 'file')}`);
          for (const [label, mime] of formats) select.append(new Option(label, mime));
          const link = downloadLink(file, formats[0][1]);
          select.addEventListener('change', () => { link.href = downloadLink(file, select.value).href; });
          actions.append(select, link);
        } else actions.append(el('span', 'muted', 'Type not approved'));
        const actionCell = el('td');
        actionCell.append(actions);
        row.append(nameCell, el('td', 'muted', type), el('td', 'muted', timestamp(file.modifiedTime, '—')), actionCell);
        return row;
      });
      $('drive-files').replaceChildren(...rows);
    }
    $('drive-more').hidden = !state.nextPageToken;
  }
  async function loadFiles(append = false) {
    if (state.driveBusy || !state.path.length) return;
    const generation = ++state.driveGeneration;
    state.driveBusy = true;
    setDriveControls();
    const parentId = state.path[state.path.length - 1].id;
    const params = new URLSearchParams({folderId: parentId});
    const query = $('drive-query').value.trim();
    if (query) params.set('query', query);
    if (append && state.nextPageToken) params.set('pageToken', state.nextPageToken);
    driveMessage('Loading selected folder…');
    try {
      const result = await api(`/api/drive/files?${params}`);
      if (generation !== state.driveGeneration) return;
      const files = Array.isArray(result.files) ? result.files.filter((file) => file && typeof file.id === 'string') : [];
      state.files = append ? [...state.files, ...files] : files;
      state.nextPageToken = result.nextPageToken || null;
      renderFiles();
      driveMessage(`${state.files.length} ${state.files.length === 1 ? 'item' : 'items'} loaded from the selected folder. Permissions remain with Google Drive.`);
    } catch (error) {
      if (generation !== state.driveGeneration) return;
      if (!append) { state.files = []; rowMessage('drive-files', 4, 'This folder could not be loaded. Retry the search after checking the connection.'); }
      driveMessage(error.message, true);
    } finally {
      if (generation === state.driveGeneration) { state.driveBusy = false; setDriveControls(); }
    }
  }
  function fileBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(String(reader.result).split(',')[1]));
      reader.addEventListener('error', () => reject(new Error('This file could not be read. Select it again.')));
      reader.readAsDataURL(file);
    });
  }
  function wireDrive() {
    $('drive-root').addEventListener('change', async () => {
      const root = state.roots.find((folder) => folder.id === $('drive-root').value);
      if (!root || state.driveBusy) return;
      state.path = [root];
      $('drive-query').value = '';
      await loadFiles();
    });
    $('drive-search').addEventListener('submit', (event) => { event.preventDefault(); loadFiles(); });
    $('drive-more').addEventListener('click', () => loadFiles(true));
    $('drive-create').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!state.driveReady || state.driveBusy || state.readOnlyDrive || !state.path.length) return;
      const name = $('folder-name').value.trim();
      if (!name) { driveMessage('Enter a project folder name.', true); return; }
      state.driveBusy = true;
      setDriveControls();
      try {
        await api('/api/drive/folders', {method: 'POST', body: {parentId: state.path[state.path.length - 1].id, name}});
        $('folder-name').value = '';
        message('The project folder was created with inherited parent permissions.');
        state.driveBusy = false;
        await loadFiles();
        await loadAudit();
      } catch (error) { driveMessage(error.message, true); }
      finally { state.driveBusy = false; setDriveControls(); }
    });
    $('drive-upload').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!state.driveReady || state.driveBusy || state.readOnlyDrive || !state.path.length) return;
      const file = $('upload-file').files[0];
      if (!file) { driveMessage('Choose a file to upload.', true); return; }
      const extension = file.name.split('.').pop().toLowerCase();
      const inferredType = [...approvedTypes].find(([, extensions]) => extensions.includes(extension))?.[0];
      const mimeType = file.type || inferredType;
      if (!approvedTypes.has(mimeType) || !approvedTypes.get(mimeType).includes(extension)) { driveMessage('Choose an approved PDF, text, CSV, JSON, image, DOCX, XLSX, or PPTX file with a matching file extension.', true); return; }
      if (!file.size || file.size > 5 * 1024 * 1024) { driveMessage('Choose a nonempty file no larger than 5 MiB.', true); return; }
      state.driveBusy = true;
      setDriveControls();
      driveMessage(`Uploading ${file.name}…`);
      try {
        const data = await fileBase64(file);
        await api('/api/drive/upload', {method: 'POST', body: {parentId: state.path[state.path.length - 1].id, name: file.name, mimeType, data}});
        $('upload-file').value = '';
        message('The file was uploaded to the selected approved Drive folder.');
        state.driveBusy = false;
        await loadFiles();
        await loadAudit();
      } catch (error) { driveMessage(error.message, true); }
      finally { state.driveBusy = false; setDriveControls(); }
    });
  }
  async function refreshAll() {
    if (state.refreshBusy) return;
    state.refreshBusy = true;
    const button = $('refresh-all');
    button.disabled = true;
    message('');
    const tasks = [loadConnectors(), loadAudit()];
    if (page === 'dashboard') tasks.push(loadDriveRoots());
    if (page === 'status') tasks.push(loadServices());
    const results = await Promise.allSettled(tasks);
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length) message(failures.map((result) => result.reason.message).join(' '), true);
    else $('last-refreshed').textContent = timestamp(new Date().toISOString());
    state.refreshBusy = false;
    button.disabled = false;
  }
  async function boot() {
    if (!['dashboard', 'status'].includes(page)) return;
    try {
      const session = await api('/api/session');
      if (typeof session.csrfToken !== 'string' || !session.csrfToken) throw new Error('The session could not be verified. Sign in again.');
      state.csrfToken = session.csrfToken;
      $('session-actor').textContent = text(session.actor, 'Authenticated workplace session');
      $('logout').disabled = false;
      $('logout').addEventListener('click', () => withButton($('logout'), async () => {
        await api('/api/logout', {method: 'POST'});
        location.replace('/login');
      }, 'Signing out…'));
      $('refresh-all').disabled = false;
      $('refresh-all').addEventListener('click', refreshAll);
      $('refresh-audit').disabled = false;
      $('refresh-audit').addEventListener('click', () => withButton($('refresh-audit'), loadAudit, 'Loading…'));
      if (page === 'dashboard') wireDrive();
      if (page === 'status') {
        $('test-services').disabled = false;
        $('test-services').addEventListener('click', () => withButton($('test-services'), async () => {
          await loadServices(true);
          await loadAudit();
        }, 'Checking…'));
      }
      await refreshAll();
      const params = new URLSearchParams(location.search);
      if (params.get('connected') === 'google') message('Google authorization completed. Review the verified status and approved Drive folders below.');
      if (params.has('error')) message('Google authorization did not complete. Test the connection and retry the official authorization flow.', true);
      if (params.has('connected') || params.has('error')) history.replaceState({}, '', location.pathname);
    } catch (error) {
      message(error.message || 'The workplace session could not be verified.', true);
      $('session-actor').textContent = 'Session unavailable';
      $('connectors').replaceChildren(el('p', 'empty-state', 'Sign in to load authorized connector status.'));
      rowMessage('audit-events', 3, 'Activity is unavailable until the session is verified.');
      if (page === 'dashboard') { resetDrive(); driveMessage('Drive is unavailable until the session is verified.'); }
      if (page === 'status') rowMessage('services', 4, 'Service status is unavailable until the session is verified.');
    }
  }
  boot();
})();
