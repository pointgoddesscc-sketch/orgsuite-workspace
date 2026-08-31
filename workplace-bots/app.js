const CONNECTORS = [
  { name: "GitHub", status: "Connected", note: "Verified identity pointgoddesscc-sketch. Repo + issue/PR tools available." },
  { name: "Linear", status: "Connected", note: "PSE Management team + OrgSuite Codex App. Issue PSE-68 created." },
  { name: "Vercel", status: "Connected", note: "Team PSE SENT (hobby) listed. Deploy of this UI not performed." },
  { name: "Gmail", status: "Available", note: "Search + draft tools present. Send is irreversible — approval required." },
  { name: "Outlook", status: "Available", note: "Search tools present. Do not send from UI." },
  { name: "Google Calendar", status: "Available", note: "Search/create tools present. Create events only after approve." },
  { name: "Calendly", status: "Available", note: "Availability + event-type tools present." },
  { name: "Microsoft Teams", status: "Available", note: "List/read/send tools present. Send requires approve." },
  { name: "Notion", status: "Available", note: "Pages tools present." },
  { name: "Figma", status: "Available", note: "Design context tools present. Writes need a file key." },
  { name: "Canva", status: "Available", note: "Design page tools present." },
  { name: "Stripe", status: "Available", note: "Read/planner tools present. Writes need human confirmation." },
  { name: "Automations", status: "Available", note: "Scheduled Grok runs. Create only when user asks." },
  { name: "Excalidraw", status: "Ready to Configure", note: "Listed in account; no live probe this session." },
  { name: "GoDaddy", status: "Ready to Configure", note: "API-ready per workplace docs. Secrets stay on host." },
  { name: "Apple Home / HomePod", status: "Proposed", note: "Shortcuts → authenticated OrgSuite API only. No direct HomePod control." },
  { name: "App Store Grok Bot", status: "Requires Authorization", note: "Rejected as architecture. Bundle co.anysphere.sand is not this product." }
];

const BOTS = [
  {
    id: "ops",
    name: "Ops Coordinator",
    connectors: "Linear · GitHub · Vercel",
    status: "Connected",
    help: "Coordinates workplace status. Can propose Linear comments and GitHub file changes. Cannot merge or deploy without approve."
  },
  {
    id: "inbox",
    name: "Inbox Manager",
    connectors: "Gmail · Outlook",
    status: "Available",
    help: "Triages mail and writes drafts. Never sends unless you explicitly approve a send tool call."
  },
  {
    id: "calendar",
    name: "Schedule Bot",
    connectors: "Google Calendar · Calendly",
    status: "Available",
    help: "Reads availability and drafts events. Creating events or changing Calendly rules needs approve."
  },
  {
    id: "comms",
    name: "Comms Bot",
    connectors: "Microsoft Teams · Gmail",
    status: "Available",
    help: "Drafts channel or chat messages. Posting as you requires approve."
  },
  {
    id: "docs",
    name: "Docs Bot",
    connectors: "Notion · GitHub",
    status: "Available",
    help: "Drafts docs and README updates. Publishing pages needs approve."
  },
  {
    id: "design",
    name: "Design Bot",
    connectors: "Figma · Canva",
    status: "Available",
    help: "Reads design context. Does not invent file keys or brand assets from other companies."
  },
  {
    id: "revenue",
    name: "Revenue Watch",
    connectors: "Stripe",
    status: "Available",
    help: "Read-only money views. Any Stripe write stays behind Stripe human confirmation."
  },
  {
    id: "home",
    name: "Home Services Bot",
    connectors: "Apple Shortcuts · proposed API",
    status: "Proposed",
    help: "HomePod/Siri may trigger Shortcuts that call an authenticated OrgSuite endpoint. No bypass of Apple security."
  }
];

const statusClass = {
  Connected: "s-connected",
  Available: "s-available",
  "Ready to Configure": "s-ready",
  Proposed: "s-proposed",
  "Requires Authorization": "s-auth"
};

const $ = (id) => document.getElementById(id);
let selected = BOTS[0];

function log(text) {
  const box = $("log");
  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `<div>${escapeHtml(text)}</div><div class="tiny">${new Date().toLocaleString()}</div>`;
  box.prepend(item);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
}

function renderBots() {
  $("bots").innerHTML = BOTS.map((b) => `
    <button class="bot ${selected.id === b.id ? "active" : ""}" data-id="${b.id}" type="button">
      <div class="name">${escapeHtml(b.name)}</div>
      <div class="meta">${escapeHtml(b.connectors)}</div>
      <div class="status ${statusClass[b.status] || ""}">${escapeHtml(b.status)}</div>
    </button>
  `).join("");
  $("bots").querySelectorAll(".bot").forEach((btn) => {
    btn.addEventListener("click", () => {
      selected = BOTS.find((b) => b.id === btn.dataset.id);
      $("composerTitle").textContent = selected.name;
      $("composerHelp").textContent = selected.help;
      renderBots();
    });
  });
}

function renderMatrix() {
  $("matrix").innerHTML = CONNECTORS.map((c) => `
    <tr>
      <td>${escapeHtml(c.name)}</td>
      <td class="status ${statusClass[c.status] || ""}">${escapeHtml(c.status)}</td>
      <td>${escapeHtml(c.note)}</td>
    </tr>
  `).join("");
}

function loadQueue() {
  try { return JSON.parse(localStorage.getItem("orgsuite_bot_queue") || "[]"); }
  catch { return []; }
}

function saveQueue(items) {
  localStorage.setItem("orgsuite_bot_queue", JSON.stringify(items));
}

function renderQueue() {
  const items = loadQueue();
  if (!items.length) {
    $("queue").innerHTML = `<p class="tiny">Empty. Queued work stays on this device until you approve or discard it.</p>`;
    return;
  }
  $("queue").innerHTML = items.map((item) => `
    <div class="queue-item">
      <div><strong>${escapeHtml(item.bot)}</strong> · ${escapeHtml(item.risk)}</div>
      <div>${escapeHtml(item.task)}</div>
      <div class="tiny">${escapeHtml(item.at)}</div>
      <div class="row">
        <button class="primary" type="button" data-approve="${item.id}">Mark approved for Grok session</button>
        <button class="ghost" type="button" data-drop="${item.id}">Discard</button>
      </div>
    </div>
  `).join("");
  $("queue").querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-approve");
      const next = loadQueue().filter((x) => x.id !== id);
      saveQueue(next);
      renderQueue();
      log("Approved locally. Bring this task back into the Grok chat to execute with live connectors. This page cannot call those APIs by itself.");
    });
  });
  $("queue").querySelectorAll("[data-drop]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-drop");
      saveQueue(loadQueue().filter((x) => x.id !== id));
      renderQueue();
      log("Discarded queued task.");
    });
  });
}

$("queueBtn").addEventListener("click", () => {
  const task = $("task").value.trim();
  if (!task) return;
  if (selected.status === "Proposed" || selected.status === "Requires Authorization") {
    log(`${selected.name} is ${selected.status}. Queue rejected.`);
    return;
  }
  const items = loadQueue();
  items.unshift({
    id: String(Date.now()),
    bot: selected.name,
    risk: $("risk").value,
    task,
    at: new Date().toISOString()
  });
  saveQueue(items);
  $("task").value = "";
  renderQueue();
  log(`Queued for ${selected.name}.`);
});

$("clearBtn").addEventListener("click", () => { $("task").value = ""; });

function tick() {
  $("clock").textContent = new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " ET";
}

renderBots();
renderMatrix();
renderQueue();
tick();
setInterval(tick, 30000);
$("composerTitle").textContent = selected.name;
$("composerHelp").textContent = selected.help;
log("Workplace Bots UI loaded. GitHub + Linear verified in the originating Grok session. This static file does not open live sessions.");
