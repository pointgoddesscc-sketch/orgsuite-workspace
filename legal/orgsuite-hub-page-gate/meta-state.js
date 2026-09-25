/* Fail-closed Meta / OrgSuite Hub state.
   User-reported != API-verified != Connected. */

window.PSE_META_CONFIG = {
  intendedPageName: "OrgSuite Hub",
  intendedCategory: "Product/service",
  facebookProfile: { label: "Kim Uhelski", source: "user_reported", status: "Active" },
  instagramProfile: { label: "kimuhelski", source: "user_reported", status: "Deactivated" },
  requiredEnv: ["META_APP_ID", "META_REDIRECT_URI", "META_PAGE_ID"],
  presentEnv: [],
  publicValues: {},
  official: {
    instagramHelp: "https://help.instagram.com/728869160569983/",
    facebookReactivate: "https://www.facebook.com/help/212666185422169",
    createPage: "https://www.facebook.com/pages/creation/",
    nameGuidelines: "https://www.facebook.com/help/519912414718764",
    pagesPolicies: "https://www.facebook.com/policies/pages_groups_events/",
    developers: "https://developers.facebook.com/apps/",
    accountsCenter: "https://accountscenter.facebook.com/"
  }
};

window.PSEMetaState = (function () {
  const KEY = "pse.meta.hub.state.v1";

  function blank() {
    return {
      legalAcceptedAt: null,
      legalVersions: [],
      metaAuth: { status: "Requires Authorization", source: "app_ready", pageId: null, access: false },
      page: { name: null, id: null, url: null, status: "Not created", source: "app_ready", verified: false },
      workplace: { status: "Not Connected", source: "app_ready" }
    };
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      return raw && typeof raw === "object" ? Object.assign(blank(), raw) : blank();
    } catch (_) {
      return blank();
    }
  }

  function save(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }

  function readPublicConfig() {
    const cfg = window.PSE_META_CONFIG || {};
    const values = cfg.publicValues || {};
    return {
      META_APP_ID: values.META_APP_ID || "",
      META_REDIRECT_URI: values.META_REDIRECT_URI || "",
      META_PAGE_ID: values.META_PAGE_ID || ""
    };
  }

  function formatCheck(key, raw) {
    const value = String(raw || "").trim();
    if (!value) return { key, state: "Missing", valid: false };
    if (key === "META_APP_ID" && !/^\d{6,20}$/.test(value)) return { key, state: "Invalid format", valid: false };
    if (key === "META_REDIRECT_URI") {
      try {
        const u = new URL(value);
        if (u.protocol !== "https:") return { key, state: "Invalid format", valid: false };
      } catch (_) {
        return { key, state: "Invalid format", valid: false };
      }
    }
    if (key === "META_PAGE_ID" && !/^\d{6,20}$/.test(value)) return { key, state: "Invalid format", valid: false };
    return { key, state: "Configured", valid: true };
  }

  function diagnose() {
    const vals = readPublicConfig();
    const rows = ["META_APP_ID", "META_REDIRECT_URI", "META_PAGE_ID"].map(function (k) { return formatCheck(k, vals[k]); });
    return { rows: rows, readyForOAuth: rows[0].valid && rows[1].valid, pageIdConfigured: rows[2].valid };
  }

  function missingEnv() {
    return diagnose().rows.filter(function (r) { return r.state !== "Configured"; }).map(function (r) { return r.key; });
  }

  function authStatus() {
    const d = diagnose();
    if (!d.readyForOAuth) {
      return { status: "Blocked — Configuration Required", missing: missingEnv(), source: "app_ready", oauthUrl: null };
    }
    const vals = readPublicConfig();
    const url = "https://www.facebook.com/v21.0/dialog/oauth?client_id=" +
      encodeURIComponent(vals.META_APP_ID) +
      "&redirect_uri=" + encodeURIComponent(vals.META_REDIRECT_URI) +
      "&response_type=code&scope=" + encodeURIComponent("pages_show_list,pages_read_engagement");
    return { status: "Requires Authorization", missing: [], source: "app_ready", oauthUrl: url };
  }

  function ingestOAuthCallback(payload) {
    if (!payload || payload.provider !== "facebook" || !payload.code || payload.error) {
      return { ok: false, reason: "OAuth response missing a real authorization code." };
    }
    const st = load();
    st.metaAuth = {
      status: "Requires Authorization",
      source: "user_reported",
      pageId: null,
      access: false,
      note: "Authorization code received. Token exchange not performed in this preview."
    };
    save(st);
    return { ok: true, state: st.metaAuth };
  }

  function ingestGraphPage(payload) {
    if (!payload || payload.source !== "graph") {
      return { ok: false, reason: "Rejected: not an API-verified Graph payload." };
    }
    const id = String(payload.id || "").trim();
    const name = String(payload.name || "").trim();
    if (!/^\d{6,20}$/.test(id)) return { ok: false, reason: "Rejected: Page ID missing or invalid." };
    if (name !== window.PSE_META_CONFIG.intendedPageName) {
      return { ok: false, reason: "Rejected: Page name is not OrgSuite Hub." };
    }
    const link = payload.link ? String(payload.link) : "";
    if (link) {
      try {
        const u = new URL(link);
        if (u.hostname !== "facebook.com" && u.hostname !== "www.facebook.com" && !/\.facebook\.com$/i.test(u.hostname)) {
          return { ok: false, reason: "Rejected: Page URL host is not Facebook." };
        }
      } catch (_) {
        return { ok: false, reason: "Rejected: Page URL invalid." };
      }
    }
    const st = load();
    st.page = {
      name: name,
      id: id,
      url: link || null,
      status: "Verified",
      source: "api_verified",
      verified: true,
      verifiedAt: new Date().toISOString()
    };
    save(st);
    return { ok: true, page: st.page };
  }

  function pipeline(appState) {
    const legalDone = !!(appState && appState.reviewed && window.PSE_POLICIES &&
      window.PSE_POLICIES.every(function (p) { return appState.reviewed[p.id]; }) &&
      appState.checks && appState.checks.mandatory && appState.checks.authorized);
    const auth = authStatus();
    const st = load();
    const pageVerified = !!(st.page && st.page.verified && st.page.id && st.page.name === window.PSE_META_CONFIG.intendedPageName && st.page.source === "api_verified");
    return [
      { id: 1, title: "Facebook profile", detail: "Kim Uhelski — Active (user-reported)", status: "Ready", source: "user_reported" },
      { id: 2, title: "Legal Center reviewed", detail: legalDone ? "Workplace agreements accepted in this app" : "Open policies and accept checkboxes", status: legalDone ? "Completed" : "Ready", source: "app_ready" },
      { id: 3, title: "Meta authorization", detail: auth.missing.length ? "Missing " + auth.missing.join(", ") : auth.status, status: auth.status.indexOf("Blocked") === 0 ? "Blocked" : "Requires Authorization", source: "app_ready" },
      { id: 4, title: "Create OrgSuite Hub Page", detail: "Official Facebook creator on Kim Uhelski", status: pageVerified ? "Completed" : "Requires Authorization", source: "app_ready" },
      { id: 5, title: "Verify returned Page", detail: pageVerified ? "API-verified Page ID present" : "No live Page ID from Meta", status: pageVerified ? "Verified" : "Not Connected", source: pageVerified ? "api_verified" : "app_ready" },
      { id: 6, title: "Connect Page to Workplace", detail: "Blocked until API-verified Page exists", status: pageVerified ? "Ready" : "Blocked", source: "app_ready" },
      { id: 7, title: "Verify integration health", detail: "No Graph session in this module", status: "Not Connected", source: "app_ready" }
    ];
  }

  return { load: load, save: save, blank: blank, missingEnv: missingEnv, authStatus: authStatus, pipeline: pipeline, diagnose: diagnose, ingestOAuthCallback: ingestOAuthCallback, ingestGraphPage: ingestGraphPage, formatCheck: formatCheck };
})();
