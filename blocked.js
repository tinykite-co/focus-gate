(function () {
  const params = new URLSearchParams(location.search);
  const site = params.get("site");
  const reason = params.get("reason"); // "permanent" | "not-for-work" | "" (mid-gauntlet no)
  const name = site || "this site";

  if (reason === "permanent") {
    document.getElementById("title").textContent = name + " is permanently blocked";
    document.getElementById("body").textContent =
      "You set " + name + " to be blocked with no prompt at all. Change that any time from settings.";
  } else if (reason === "not-for-work") {
    document.getElementById("title").textContent = name + " is blocked";
    document.getElementById("body").textContent =
      name + " isn't marked as work, and your settings have not-for-work sites set to block outright. Mark it as work, or switch that setting, to change this.";
  } else if (site) {
    document.getElementById("title").textContent = site + " is blocked";
  }
  document.getElementById("settingsBtn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
})();
