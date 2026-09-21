(function () {
  const params = new URLSearchParams(location.search);
  const tabIdParam = params.get("tabId");
  const targetUrl = params.get("target");
  const kind = params.get("kind") === "override" ? "override" : "work";

  const siteEl = document.getElementById("site");
  const urlEl = document.getElementById("url");
  const factEl = document.getElementById("fact");
  const questionEl = document.getElementById("question");
  const closerEl = document.getElementById("closer");
  const hintEl = document.getElementById("hint");
  const progressLabelEl = document.getElementById("progressLabel");
  const progressFillEl = document.getElementById("progressFill");
  const kindBadgeEl = document.getElementById("kindBadge");
  const yesBtn = document.getElementById("yes");
  const noBtn = document.getElementById("no");
  const yesWrapEl = document.querySelector(".yes-wrap");

  // The pool line (a fact or a reflective prompt) isn't always phrased as
  // something "No, close this" / "yes, continue anyway" directly answers —
  // that's the point, it's food for thought, not a yes/no quiz. So the
  // buttons always answer this one fixed, always-sensible question instead,
  // shown right above them every time.
  function closerTextFor(siteName) {
    return `Still want to open ${siteName}?`;
  }

  urlEl.textContent = targetUrl || "";

  let questions = [];
  let index = 0;
  let settings = null;
  let siteName = "this site";

  function resolveTabId(cb) {
    if (tabIdParam) {
      cb(parseInt(tabIdParam, 10));
      return;
    }
    chrome.tabs.getCurrent((tab) => cb(tab ? tab.id : -1));
  }

  // Randomizes whether "No" or "yes" appears on top, each question — so
  // getting through the gauntlet takes actually reading each time, not
  // just clicking the same spot on autopilot.
  function shuffleButtonPositions() {
    const noFirst = Math.random() < 0.5;
    noBtn.style.order = noFirst ? "0" : "1";
    yesWrapEl.style.order = noFirst ? "1" : "0";
  }

  function renderStep() {
    shuffleButtonPositions();
    const total = questions.length;
    const step = questions[index];
    if (step && step.fact) {
      factEl.textContent = step.fact;
      factEl.hidden = false;
    } else {
      factEl.hidden = true;
    }
    questionEl.textContent = step ? step.question : "";
    closerEl.textContent = closerTextFor(siteName);
    if (total > 1) {
      progressLabelEl.textContent = `Question ${index + 1} of ${total}`;
      progressFillEl.style.width = `${Math.round(((index + 1) / total) * 100)}%`;
    } else {
      progressLabelEl.textContent = "";
      progressFillEl.style.width = "100%";
    }
    const minutes = settings.graceMinutes || 5;
    const hintTemplate =
      kind === "override"
        ? settings.overrideHint ||
          "Not marked as work, so it's locked by default. Saying yes {count} times in a row unlocks it for {minutes} minutes."
        : settings.promptHint ||
          "Getting through all {count} unlocks this page for {minutes} minutes.";
    hintEl.textContent = hintTemplate.replace(/\{minutes\}/g, minutes).replace(/\{count\}/g, total);
  }

  function finish() {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    resolveTabId((tabId) => {
      chrome.runtime.sendMessage(
        { type: "approve", tabId, url: targetUrl, kind },
        () => {
          location.href = targetUrl;
        }
      );
    });
  }

  function deny() {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    resolveTabId((tabId) => {
      chrome.runtime.sendMessage({ type: "deny", tabId }, () => {
        location.href =
          chrome.runtime.getURL("blocked.html") +
          "?site=" +
          encodeURIComponent(siteEl.textContent);
      });
    });
  }

  fgGetSettings().then(async (s) => {
    settings = s;
    const site = fgSiteForUrl(settings, targetUrl || "");
    siteName = site.name;
    siteEl.textContent = site.name;
    kindBadgeEl.textContent = kind === "override" ? "Not marked for work" : "Work";
    kindBadgeEl.className = "kind-badge " + kind;
    yesBtn.textContent = kind === "override" ? "yes, continue anyway" : "yes, this is for work";

    // Real numbers for today, on this exact site — used to ground every
    // question in an actual fact instead of a generic guilt-trip.
    const minutesBefore = await fgGetSiteMinutesToday(site.id);
    const opens = await fgRecordSiteOpen(site.id, site.name);
    const factData = { site: site.name, opens, minutes: minutesBefore };

    questions =
      kind === "override" ? fgPickOverrideRun(settings, factData) : fgPickQuestionRun(settings, factData);
    index = 0;
    renderStep();
  });

  noBtn.addEventListener("click", deny);

  yesBtn.addEventListener("click", () => {
    if (!settings) return;
    if (index + 1 >= questions.length) {
      finish();
    } else {
      index += 1;
      renderStep();
    }
  });

  // "No" is the safe, easy default: Enter and Escape both act as no. There
  // is deliberately no keyboard shortcut for "yes" — it takes an actual
  // click each time, on purpose.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "Escape") noBtn.click();
  });

  noBtn.focus();
})();
