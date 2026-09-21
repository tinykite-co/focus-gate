fgGetSettings().then((settings) => {
  const ul = document.getElementById("siteList");
  const labels = { work: "work", default: "not for work", blocked: "blocked" };
  settings.sites.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${labels[s.mode] || "not for work"}`;
    ul.appendChild(li);
  });
  const workCount = settings.sites.filter((s) => s.mode === "work").length;
  const blockedCount = settings.sites.filter((s) => s.mode === "blocked").length;
  let desc =
    settings.notForWorkBehavior === "block"
      ? `Work sites ask ${settings.minQuestions}-${settings.maxQuestions} varied questions to unlock for ${settings.graceMinutes} min. Everything else is just blocked outright, no override.`
      : `Work sites ask ${settings.minQuestions}-${settings.maxQuestions} varied questions; everything else asks ${settings.overrideMinQuestions}-${settings.overrideMaxQuestions}. Getting through unlocks for ${settings.graceMinutes} min.`;
  if (workCount === 0) {
    desc += ` Nothing is marked as work yet.`;
  }
  if (blockedCount > 0) {
    desc += ` ${blockedCount} site${blockedCount === 1 ? " is" : "s are"} permanently blocked.`;
  }
  document.getElementById("desc").textContent = desc;
});
document.getElementById("openSettings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
document.getElementById("openInsights").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("stats.html") });
});
