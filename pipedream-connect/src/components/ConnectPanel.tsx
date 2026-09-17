"use client";

import { useCallback, useMemo, useState } from "react";
import { PipedreamClient } from "@pipedream/sdk";

const APPS = [
  { slug: "slack", label: "Slack" },
  { slug: "github", label: "GitHub" },
  { slug: "google_sheets", label: "Google Sheets" },
  { slug: "gmail", label: "Gmail" },
  { slug: "notion", label: "Notion" },
  { slug: "linear", label: "Linear" },
];

type Account = {
  id: string | null;
  name: string | null;
  healthy: boolean | null;
  dead: boolean | null;
  appName: string | null;
  appSlug: string | null;
};

export function ConnectPanel() {
  const [externalUserId, setExternalUserId] = useState(
    process.env.NEXT_PUBLIC_EXTERNAL_USER_ID || "orgsuite-dev-owner",
  );
  const [app, setApp] = useState("slack");
  const [status, setStatus] = useState(
    "Ready to configure. Tokens are created only after you set OAuth credentials.",
  );
  const [tone, setTone] = useState<"muted" | "ok" | "err">("muted");
  const [connectLinkUrl, setConnectLinkUrl] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const client = useMemo(() => {
    return new PipedreamClient({
      projectEnvironment: "development",
      externalUserId,
      tokenCallback: async () => {
        const res = await fetch("/api/connect-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ external_user_id: externalUserId }),
        });
        const data = await res.json();
        if (!res.ok || !data.token) {
          throw new Error(data.error || "Failed to fetch Connect token");
        }
        setConnectLinkUrl(
          data.connectLinkUrl
            ? `${data.connectLinkUrl}${data.connectLinkUrl.includes("?") ? "&" : "?"}app=${encodeURIComponent(app)}`
            : null,
        );
        return data.token as string;
      },
    });
  }, [externalUserId, app]);

  const refreshAccounts = useCallback(async () => {
    setTone("muted");
    setStatus("Listing accounts...");
    const res = await fetch(`/api/accounts?external_user_id=${encodeURIComponent(externalUserId)}`);
    const data = await res.json();
    if (!res.ok) {
      setTone("err");
      setStatus(data.error || "Could not list accounts");
      return;
    }
    setAccounts(data.accounts || []);
    setTone("ok");
    setStatus(`Loaded ${data.accounts?.length ?? 0} account(s) in development.`);
  }, [externalUserId]);

  async function connectAccount() {
    setTone("muted");
    setStatus(`Opening Connect for ${app} in development...`);
    try {
      await client.connectAccount({
        app,
        onSuccess: (account) => {
          setTone("ok");
          setStatus(`Connected ${app}: ${account.id}`);
          void refreshAccounts();
        },
        onError: (err) => {
          setTone("err");
          setStatus(err.message || "Connection failed");
        },
      });
    } catch (error) {
      setTone("err");
      setStatus(error instanceof Error ? error.message : "Connection failed");
    }
  }

  return (
    <section className="card">
      <h2>Connect an account</h2>
      <p className="muted">
        Project <code>proj_qzsEmM9</code> · environment <code>development</code>.
        In development, Pipedream requires the connecting user to be signed in at pipedream.com.
      </p>
      <div className="row" style={{ marginTop: 16 }}>
        <label className="muted">
          External user ID
          <div>
            <input value={externalUserId} onChange={(event) => setExternalUserId(event.target.value)} aria-label="External user ID" />
          </div>
        </label>
        <label className="muted">
          App
          <div>
            <select value={app} onChange={(event) => setApp(event.target.value)} aria-label="App slug">
              {APPS.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </select>
          </div>
        </label>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <button type="button" onClick={() => void connectAccount()}>
          Connect {APPS.find((item) => item.slug === app)?.label}
        </button>
        <button type="button" className="secondary" onClick={() => void refreshAccounts()}>
          List accounts
        </button>
      </div>
      <p className={tone} style={{ marginTop: 14 }} role="status">{status}</p>
      {connectLinkUrl ? (
        <p className="muted">
          Connect Link: <a href={connectLinkUrl} target="_blank" rel="noreferrer">open hosted flow</a>
        </p>
      ) : null}
      {accounts.length > 0 ? (
        <ul>
          {accounts.map((account) => (
            <li key={account.id ?? account.name}>
              {account.appName || account.appSlug || "App"} — {account.name || account.id}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
