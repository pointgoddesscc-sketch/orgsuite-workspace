/* Source for orgsuite-cf-dash. Live copy is deployed on Cloudflare Workers. */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/status") {
      return Response.json({ status: "ok", worker: "orgsuite-cf-dash", host: "dash.pse-sent.com" });
    }
    if (url.pathname === "/api/live") {
      const probes = [];
      for (const [name, target] of [["host", "https://host.pse-sent.com/status"], ["apex", "https://pse-sent.com"], ["kidrock", "https://kidrockmanagementteamsent.com"], ["cf", "https://www.cloudflarestatus.com/api/v2/status.json"]]) {
        try {
          const res = await fetch(target);
          probes.push({ name, status: res.status });
        } catch (err) {
          probes.push({ name, status: "error" });
        }
      }
      return Response.json({ probes });
    }
    return new Response("OrgSuite Cloudflare Dashboard source. Live at https://dash.pse-sent.com", { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
};
