(function () {
  let settings = null;

  const siteListEl = document.getElementById("siteList");
  const newSiteNameEl = document.getElementById("newSiteName");
  const newSiteDomainEl = document.getElementById("newSiteDomain");
  const newSiteModeEl = document.getElementById("newSiteMode");
  const addSiteBtn = document.getElementById("addSite");
  const promptMessagesEl = document.getElementById("promptMessages");
  const restoreDefaultsBtn = document.getElementById("restoreDefaults");
  const behaviorOverrideEl = document.getElementById("behaviorOverride");
  const behaviorBlockEl = document.getElementById("behaviorBlock");
  const overrideHintEl = document.getElementById("overrideHint");
  const graceMinutesEl = document.getElementById("graceMinutes");
  const overrideMinQuestionsEl = document.getElementById("overrideMinQuestions");
  const overrideMaxQuestionsEl = document.getElementById("overrideMaxQuestions");
  const saveBtn = document.getElementById("save");
  const statusEl = document.getElementById("status");
  const aiPromptEl = document.getElementById("aiPrompt");
  const copyPromptBtn = document.getElementById("copyPrompt");

  const AI_PROMPT_TEMPLATE = `I'm setting up a personal website blocker (Focus Gate). Before it lets me into distracting sites, it runs me through several short deterrent questions in a row — a real "do you actually want this?" gauntlet, personal enough that I can't just click through it on autopilot.

Don't generate anything yet. First, interview me — ask me questions one at a time (or in a short batch), covering things like:
- My name and how I'd like to be addressed.
- The people closest to me (partner, kids, family, close friends) — names and what I'd rather be doing with/for them.
- My real ambitions — career, business, creative, financial — the ones I keep saying I don't have time for.
- Health/fitness goals I keep deprioritizing.
- Hobbies, skills, or projects I've let slide.
- What a genuinely well-spent day looks like for me, versus what a wasted one looks like.
- What I'm usually avoiding when I end up on these sites (boredom, stress, procrastination, a specific task I don't want to do).
- Anything I'd want said to me, bluntly, to snap me out of mindless scrolling.

Keep asking follow-ups until you have enough real material about my life, not just generic answers.

Then generate as many personalized deterrent lines as you reasonably can (aim for hundreds if you can sustain the quality — otherwise as many as you can without repeating yourself or getting generic). Rules for the lines:
- Second person ("you"), one sentence or short question each, no numbering, no bullet points — just one per line.
- Blunt and a little uncomfortable, but not cruel or guilt-tripping.
- Actually use the specific names, goals, and details I gave you — not vague placeholders.
- Mix tones: opportunity cost, what/who I could be doing instead, my stated ambitions, my health goals, my honest reason for being here, future-self framing.
- Final output: just the list, one line per message, nothing else — no intro, no headers, no numbering — so I can paste it straight into the extension's settings.`;

  function slugify(str) {
    return (
      str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "site-" + Date.now()
    );
  }

  function renderSites() {
    siteListEl.innerHTML = "";
    settings.sites.forEach((site, idx) => {
      const row = document.createElement("div");
      row.className = "site-row";

      const left = document.createElement("div");
      const nameWrap = document.createElement("div");
      nameWrap.className = "name-wrap";
      const nameEl = document.createElement("span");
      nameEl.className = "name";
      nameEl.textContent = site.name;
      nameWrap.appendChild(nameEl);
      if (site.mode === "blocked") {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "Blocked";
        nameWrap.appendChild(badge);
      } else if (site.mode === "work") {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.style.background = "#24352c";
        badge.style.color = "#7fd6a4";
        badge.textContent = "Work";
        nameWrap.appendChild(badge);
      } else {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.style.background = "#2c2d36";
        badge.style.color = "#9a9fa8";
        badge.textContent = "Not for work";
        nameWrap.appendChild(badge);
      }
      left.appendChild(nameWrap);
      const domainsEl = document.createElement("div");
      domainsEl.className = "domains";
      domainsEl.textContent = site.hostSuffixes.join(", ");
      left.appendChild(domainsEl);
      row.appendChild(left);

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.alignItems = "center";
      right.style.gap = "8px";

      const modeSelect = document.createElement("select");
      const optDefault = document.createElement("option");
      optDefault.value = "default";
      optDefault.textContent = "Not for work (default)";
      const optWork = document.createElement("option");
      optWork.value = "work";
      optWork.textContent = "I use this for work";
      const optBlocked = document.createElement("option");
      optBlocked.value = "blocked";
      optBlocked.textContent = "Block permanently";
      modeSelect.appendChild(optDefault);
      modeSelect.appendChild(optWork);
      modeSelect.appendChild(optBlocked);
      modeSelect.value = site.mode || "default";
      modeSelect.addEventListener("change", () => {
        settings.sites[idx].mode = modeSelect.value;
        renderSites();
      });
      right.appendChild(modeSelect);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        settings.sites.splice(idx, 1);
        renderSites();
      });
      right.appendChild(removeBtn);

      row.appendChild(right);
      siteListEl.appendChild(row);
    });
  }

  function loadIntoForm() {
    renderSites();
    promptMessagesEl.value = settings.promptMessages.join("\n");
    (settings.notForWorkBehavior === "block" ? behaviorBlockEl : behaviorOverrideEl).checked = true;
    overrideHintEl.value = settings.overrideHint;
    graceMinutesEl.value = settings.graceMinutes;
    overrideMinQuestionsEl.value = settings.overrideMinQuestions;
    overrideMaxQuestionsEl.value = settings.overrideMaxQuestions;
    aiPromptEl.textContent = AI_PROMPT_TEMPLATE;
  }

  fgGetSettings().then((s) => {
    settings = s;
    loadIntoForm();
  });

  addSiteBtn.addEventListener("click", () => {
    const name = newSiteNameEl.value.trim();
    const domainsRaw = newSiteDomainEl.value.trim();
    if (!name || !domainsRaw) {
      statusEl.textContent = "Enter a name and at least one domain.";
      return;
    }
    const hostSuffixes = domainsRaw
      .split(",")
      .map((d) => d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
      .filter(Boolean);
    if (hostSuffixes.length === 0) {
      statusEl.textContent = "Enter at least one valid domain.";
      return;
    }
    const chosenMode = ["work", "blocked"].includes(newSiteModeEl.value)
      ? newSiteModeEl.value
      : "default";
    settings.sites.push({
      id: slugify(name),
      name,
      hostSuffixes,
      mode: chosenMode
    });
    newSiteNameEl.value = "";
    newSiteDomainEl.value = "";
    newSiteModeEl.value = "default";
    statusEl.textContent = "";
    renderSites();
  });

  restoreDefaultsBtn.addEventListener("click", () => {
    promptMessagesEl.value = DEFAULT_SETTINGS.promptMessages.join("\n");
  });

  copyPromptBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(AI_PROMPT_TEMPLATE).then(() => {
      copyPromptBtn.textContent = "Copied!";
      setTimeout(() => (copyPromptBtn.textContent = "Copy prompt"), 1500);
    });
  });

  saveBtn.addEventListener("click", () => {
    const lines = promptMessagesEl.value
      .split("\n")
      .map((l) => l.replace(/^[\s]*[-*•]\s*/, "").replace(/^[\s]*\d+[\.\)]\s*/, "").trim())
      .filter(Boolean);
    settings.promptMessages = lines.length ? lines : structuredClone(DEFAULT_SETTINGS.promptMessages);
    settings.notForWorkBehavior = behaviorBlockEl.checked ? "block" : "override";
    settings.overrideHint = overrideHintEl.value.trim();
    const minutes = parseInt(graceMinutesEl.value, 10);
    settings.graceMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 5;

    let overMinQ = parseInt(overrideMinQuestionsEl.value, 10);
    let overMaxQ = parseInt(overrideMaxQuestionsEl.value, 10);
    if (!Number.isFinite(overMinQ) || overMinQ < 1) overMinQ = 7;
    if (!Number.isFinite(overMaxQ) || overMaxQ < overMinQ) overMaxQ = overMinQ;
    settings.overrideMinQuestions = overMinQ;
    settings.overrideMaxQuestions = overMaxQ;

    fgSaveSettings(settings).then(() => {
      chrome.runtime.sendMessage({ type: "settingsUpdated" }, () => {
        statusEl.textContent = "Saved.";
        setTimeout(() => (statusEl.textContent = ""), 2000);
      });
    });
  });
})();
