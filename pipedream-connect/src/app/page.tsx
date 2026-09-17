import { ConnectPanel } from "@/components/ConnectPanel";

export default function HomePage() {
  return (
    <main>
      <p className="muted">OrgSuite · Pipedream Connect</p>
      <h1>Add managed auth to the workplace app</h1>
      <p className="muted">
        Official API: <code>https://api.pipedream.com/v1/connect/proj_qzsEmM9</code>.
        Secrets stay in <code>.env.local</code>. This page is not a live Pipedream session until OAuth credentials exist.
      </p>
      <section className="card">
        <h2>Status</h2>
        <ul>
          <li>Code: <strong>Completed</strong></li>
          <li>Project: <code>proj_qzsEmM9</code> · <strong>Available</strong></li>
          <li>Environment: <code>development</code> · <strong>Ready to Configure</strong></li>
          <li>Pipedream OAuth client: <strong>Requires Authorization</strong></li>
          <li>Connected accounts: <strong>Not Connected</strong></li>
        </ul>
      </section>
      <ConnectPanel />
    </main>
  );
}
