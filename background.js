// Focus Gate — background service worker
// Gates configured sites behind a "is this for work?" prompt. An approval
// is valid for the configured grace period and only for the exact URL
// approved — a new URL, or the timer running out on the same URL, forces
// the prompt again. Sites, the grace period and the prompt text are all
// configurable from the options page.

importScripts("settings.js");

let currentSettings = null;
let navListenersRegistered = false;

function allowKey(tabId) {
  return `allow_${tabId}`;
}

async function getAllowEntry(tabId) {
  const data = await chrome.storage.session.get(allowKey(tabId));
  return data[allowKey(tabId)] || null;
}

async function setAllowEntry(tabId, url, expiresAt, kind) {
  await chrome.storage.session.set({ [allowKey(tabId)]: { url, expiresAt, kind } });
}

async function clearAllowEntry(tabId) {
  await chrome.storage.session.remove(allowKey(tabId));
  await chrome.alarms.clear(`recheck_${tabId}`);
}

function gateUrlFor(tabId, targetUrl, kind) {
  return (
    chrome.runtime.getURL("gate.html") +
    "?tabId=" +
    encodeURIComponent(tabId) +
    "&target=" +
    encodeURIComponent(targetUrl) +
    "&kind=" +
    encodeURIComponent(kind || "work")
  );
}

function blockedUrlFor(siteName, reason) {
  // reason: "permanent" (site set to Block permanently) or
  // "not-for-work" (site not marked as work, and notForWorkBehavior is
  // "block" — flat block, no override, but not the same as "permanent"
  // since changing the setting or marking the site as work reopens it).
  return (
    chrome.runtime.getURL("blocked.html") +
    "?site=" +
    encodeURIComponent(siteName) +
    "&reason=" +
    encodeURIComponent(reason || "")
  );
}

function isGatedUrl(settings, url) {
  return !!fgFindGatedSite(settings, url);
}

async function checkAndGate(tabId, url) {
  if (tabId < 0) return;
  if (url.startsWith(chrome.runtime.getURL(""))) return; // our own pages
  if (!currentSettings) return;

  const site = fgFindGatedSite(currentSettings, url);
  if (!site) return;

  if (site.mode === "blocked") {
    // Permanently blocked: no prompt, no grace period, always redirected.
    await clearAllowEntry(tabId);
    try {
      await chrome.tabs.update(tabId, { url: blockedUrlFor(site.name, "permanent") });
    } catch (e) {
      // ignore
    }
    return;
  }

  if (site.mode !== "work" && currentSettings.notForWorkBehavior === "block") {
    // Not marked as work, and the user's chosen behavior for that is a
    // flat block — no questions, no override, every time.
    await clearAllowEntry(tabId);
    try {
      await chrome.tabs.update(tabId, { url: blockedUrlFor(site.name, "not-for-work") });
    } catch (e) {
      // ignore
    }
    return;
  }

  const entry = await getAllowEntry(tabId);
  const now = Date.now();

  if (entry && entry.url === url && entry.expiresAt > now) {
    return; // still within the approved window for this exact URL
  }

  // "work" sites get the varied deterrent gauntlet; everything else
  // ("default" — not marked as work, with notForWorkBehavior "override")
  // gets the longer, varied override gauntlet.
  const kind = site.mode === "work" ? "work" : "override";

  await clearAllowEntry(tabId);
  try {
    await chrome.tabs.update(tabId, { url: gateUrlFor(tabId, url, kind) });
  } catch (e) {
    // tab may have gone away mid-navigation; nothing to do
  }
}

function onBeforeNavigate(details) {
  if (details.frameId !== 0) return;
  checkAndGate(details.tabId, details.url);
}
function onCommitted(details) {
  if (details.frameId !== 0) return;
  checkAndGate(details.tabId, details.url);
}
function onHistoryStateUpdated(details) {
  if (details.frameId !== 0) return;
  checkAndGate(details.tabId, details.url);
}

function registerNavListeners() {
  // Filterless registration: we still gate correctly because checkAndGate
  // re-checks isGatedUrl() against the *current* settings on every call.
  // This lets us add/remove sites at runtime without re-subscribing to
  // webNavigation (which would need host permissions granted first anyway).
  if (navListenersRegistered) return;
  chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate);
  chrome.webNavigation.onCommitted.addListener(onCommitted);
  chrome.webNavigation.onHistoryStateUpdated.addListener(onHistoryStateUpdated);
  navListenersRegistered = true;
}

async function refreshSettings() {
  currentSettings = await fgGetSettings();
  registerNavListeners();
}

function ensureTickAlarm() {
  chrome.alarms.get("tick", (existing) => {
    if (!existing) {
      chrome.alarms.create("tick", { periodInMinutes: 1 });
    }
  });
}

// Every minute: if the user is actively at their computer (not idle) and
// the tab they're actually looking at is on a gated site, log a minute of
// usage against that site. Only loaded (i.e. previously-approved) gated
// pages can be showing at all, since unapproved ones get redirected to the
// gate before they render.
async function tickUsage() {
  if (!currentSettings) return;

  chrome.idle.queryState(60, async (state) => {
    if (state !== "active") return;

    let tabs;
    try {
      tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    } catch (e) {
      return;
    }
    const tab = tabs && tabs[0];
    if (!tab || !tab.url) return;
    if (tab.url.startsWith(chrome.runtime.getURL(""))) return;
    if (!isGatedUrl(currentSettings, tab.url)) return;

    const site = fgSiteForUrl(currentSettings, tab.url);
    fgAddTime(site.id, site.name, 1);
  });
}

// Load settings at service worker startup.
refreshSettings();
ensureTickAlarm();

chrome.runtime.onInstalled.addListener(() => {
  refreshSettings();
  ensureTickAlarm();
});
chrome.runtime.onStartup.addListener(() => {
  refreshSettings();
  ensureTickAlarm();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    currentSettings = Object.assign(
      structuredClone(DEFAULT_SETTINGS),
      changes.settings.newValue || {}
    );
  }
});

// The grace-period timer: if the tab is still sitting on the approved URL
// when the alarm fires, lock it again.
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "tick") {
    tickUsage();
    return;
  }

  const match = alarm.name.match(/^recheck_(\d+)$/);
  if (!match) return;
  const tabId = parseInt(match[1], 10);

  const entry = await getAllowEntry(tabId);
  if (!entry) return;

  let tab;
  try {
    tab = await chrome.tabs.get(tabId);
  } catch (e) {
    await clearAllowEntry(tabId);
    return;
  }

  if (tab.url === entry.url) {
    await clearAllowEntry(tabId);
    try {
      await chrome.tabs.update(tabId, { url: gateUrlFor(tabId, entry.url, entry.kind) });
    } catch (e) {
      // ignore
    }
  }
  // If the URL already changed, the nav listeners already re-gated and this
  // stale alarm has nothing to do.
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "approve") {
    const tabId = msg.tabId;
    const url = msg.url;
    const kind = msg.kind === "override" ? "override" : "work";
    fgRecordDecision("yes");
    (currentSettings ? Promise.resolve(currentSettings) : fgGetSettings()).then(
      (settings) => {
        const graceMs = (settings.graceMinutes || 5) * 60 * 1000;
        const expiresAt = Date.now() + graceMs;
        setAllowEntry(tabId, url, expiresAt, kind).then(() => {
          chrome.alarms.create(`recheck_${tabId}`, {
            delayInMinutes: settings.graceMinutes || 5
          });
          sendResponse({ ok: true });
        });
      }
    );
    return true; // keep channel open for async sendResponse
  }

  if (msg.type === "deny") {
    const tabId = msg.tabId;
    fgRecordDecision("no");
    clearAllowEntry(tabId).then(() => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === "settingsUpdated") {
    refreshSettings().then(() => sendResponse({ ok: true }));
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  clearAllowEntry(tabId);
});
