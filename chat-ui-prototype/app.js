const CHANNELS = [
  {
    id: "grok",
    name: "Grok / xAI",
    status: "Connected",
    help: "Research, planning, and OrgSuite engineering partner in this session.",
    transport: "This Grok chat",
    messages: [
      { from: "Grok", dir: "in", text: "OrgSuite Chat UI Prototype loaded. Canary Mail is a device client, not a live API.", at: "2026-09-01T19:40:00Z" }
    ]
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    status: "Available",
    help: "Complementary reasoning and Codex repo work. Separate authorized system.",
    transport: "Authorized OpenAI / Codex path only",
    messages: [
      { from: "OrgSuite", dir: "out", text: "Keep ChatGPT and Grok roles distinct. Do not claim a live ping unless an API call succeeds.", at: "2026-08-31T15:00:00Z" }
    ]
  },
  {
    id: "meta",
    name: "Meta AI",
    status: "Ready to Configure",
    help: "WhatsApp / Meta destination remains owner-authorized. See PSE-7 / PSE-63.",
    transport: "WhatsApp Cloud API after owner env + callback",
    messages: [
      { from: "System", dir: "in", text: "Meta live webhook is not claimed from this static prototype.", at: "2026-08-31T16:00:00Z" }
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    status: "Requires Authorization",
    help: "Official Bot API only. Token stays in env / Keychain. Continue on PSE-47.",
    transport: "Telegram Bot API webhook",
    messages: [
      { from: "System", dir: "in", text: "Do not paste BotFather tokens into this UI.", at: "2026-08-27T12:00:00Z" }
    ]
  },
  {
    id: "copilot",
    name: "Copilot",
    status: "Available",
    help: "Microsoft 365 / GitHub Copilot productivity surface.",
    transport: "Authorized Copilot / GitHub tools",
    messages: [
      { from: "OrgSuite", dir: "out", text: "Use Copilot for code and document assistance. Secrets stay out of chat.", at: "2026-08-21T10:00:00Z" }
    ]
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    status: "Available",
    help: "Workplace chat. Posting as you requires explicit approve.",
    transport: "Connected Teams connector",
    messages: [
      { from: "Teams", dir: "in", text: "Connector tools can list/read. Send stays behind approval.", at: "2026-08-21T11:00:00Z" }
    ]
  },
  {
    id: "canary",
    name: "Canary Mail",
    status: "Ready to Configure",
    help: "Device inbox for Gmail, Outlook, iCloud, Exchange, and IMAP. OrgSuite never logs into Canary.",
    transport: "Gmail / Outlook draft → mailbox sync → Canary",
    messages: [
      {
        from: "Canary Mail",
        dir: "in",
        text: "[Canary Mail] Channel added to the Chat UI Prototype. This is a preview of the workplace inbox, not a live Canary session.",
        at: "2026-09-01T19:43:00Z"
      },
      {
        from: "OrgSuite",
        dir: "out",
        text: "Newsletters and approved Gmail/Outlook drafts should appear here after the owner’s Canary accounts are Connected on device (PSE-62).",
        at: "2026-09-01T19:43:20Z"
      }
    ]
  }
];

const statusClass = {
  Connected: "s-connected",
  Completed: "s-completed",
  Available: "s-available",
  "Ready to Configure": "s-ready",
  Proposed: "s-proposed",
  "Requires Authorization": "s-auth"
};

const $ = (id) => document.getElementById(id);
let selected = CHANNELS.find((c) => c.id === "canary") || CHANNELS[0];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function log(text) {
  const box = $("log");
  const item = document.createElement("p");
  item.className = "tiny";
  item.textContent = `${new Date().toLocaleTimeString()} · ${text}`;
  box.prepend(item);
}

function loadExtras() {
  try { return JSON.parse(localStorage.getItem("orgsuite_chat_ui_extra") || "{}"); }
  catch { return {}; }
}

function saveExtra(channelId, msg) {
  const extra = loadExtras();
  extra[channelId] = extra[channelId] || [];
  extra[channelId].unshift(msg);
  localStorage.setItem("orgsuite_chat_ui_extra", JSON.stringify(extra));
}

function allMessages(channel) {
  const extra = loadExtras()[channel.id] || [];
  return [...extra, ...channel.messages];
}

function renderChannels() {
  $("channels").innerHTML = CHANNELS.map((c) => `
    <button class="channel ${selected.id === c.id ? "active" : ""}" data-id="${c.id}" type="button">
      <div class="name">
        <span>${escapeHtml(c.name)}</span>
        <span class="status ${statusClass[c.status] || ""}">${escapeHtml(c.status)}</span>
      </div>
      <div class="meta">${escapeHtml(c.transport)}</div>
    </button>
  `).join("");
  $("channels").querySelectorAll(".channel").forEach((btn) => {
    btn.addEventListener("click", () => {
      selected = CHANNELS.find((c) => c.id === btn.dataset.id);
      render();
    });
  });
}

function renderThread() {
  $("threadTitle").textContent = selected.name;
  $("threadHelp").textContent = selected.help;
  $("banner").textContent = selected.id === "canary"
    ? "Canary Mail status: Ready to Configure on device. Gmail and Outlook connectors are Available. No remote Canary login."
    : `${selected.name} uses ${selected.transport}. This page does not call live APIs.`;
  $("msgs").innerHTML = allMessages(selected).map((m) => `
    <article class="msg ${m.dir}">
      <div class="who">${escapeHtml(m.from)}</div>
      <div>${escapeHtml(m.text)}</div>
      <div class="when">${escapeHtml(new Date(m.at).toLocaleString())}</div>
    </article>
  `).join("");
}

function render() {
  renderChannels();
  renderThread();
}

$("composer").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("draft").value.trim();
  if (!text) return;
  if (selected.status === "Requires Authorization" || selected.status === "Proposed") {
    log(`${selected.name} is ${selected.status}. Queue rejected.`);
    return;
  }
  const msg = {
    from: "You",
    dir: "out",
    text: selected.id === "canary"
      ? `[Canary Mail draft] ${text}`
      : text,
    at: new Date().toISOString()
  };
  saveExtra(selected.id, msg);
  $("draft").value = "";
  render();
  log(selected.id === "canary"
    ? "Queued Canary-bound draft locally. Real delivery requires approved Gmail/Outlook send."
    : `Queued local draft for ${selected.name}.`);
});

$("clearBtn").addEventListener("click", () => { $("draft").value = ""; });

function tick() {
  $("clock").textContent = new Date().toLocaleString("en-GB", { hour12: false }) + " WAT";
}

render();
tick();
setInterval(tick, 30000);
log("Chat UI Prototype ready. Canary Mail channel added.");
