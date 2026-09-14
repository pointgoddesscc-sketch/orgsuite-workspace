(function () {
  const clock = document.getElementById("clock");
  const tick = () => {
    if (!clock) return;
    clock.textContent = new Date().toLocaleString("en-GB", {
      timeZone: "Africa/Lagos",
      hour12: false
    }) + " WAT";
  };
  tick();
  setInterval(tick, 1000);

  const googleStatus = [
    "OrgSuite Cloud Storage — Google",
    "Gmail: Connected (pointgoddesscc@gmail.com)",
    "Drive PIP: Connected (0.41 GB / 15 GB)",
    "Drive native MCP: Requires Authorization",
    "Linear: PSE-100"
  ].join("\n");

  const msStatus = [
    "OrgSuite Cloud Storage — Microsoft",
    "Outlook: Connected (chrisemerson360agency@outlook.com)",
    "Inbox: 113 / 82 unread",
    "OneDrive Files.ReadWrite.All: Requires Authorization",
    "Linear: PSE-100"
  ].join("\n");

  const bindCopy = (id, text) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text);
        el.textContent = "Copied";
        setTimeout(() => { el.textContent = id === "copyGoogle" ? "Copy Drive status" : "Copy Microsoft status"; }, 1600);
      } catch {
        el.textContent = "Copy failed";
      }
    });
  };

  bindCopy("copyGoogle", googleStatus);
  bindCopy("copyMs", msStatus);

  const drop = document.getElementById("drop");
  if (drop) {
    ["dragover", "drop"].forEach((evt) => {
      drop.addEventListener(evt, (e) => {
        e.preventDefault();
        drop.textContent = "Upload blocked — OneDrive and native Drive mounts are not authorized in this static page.";
      });
    });
  }
})();
