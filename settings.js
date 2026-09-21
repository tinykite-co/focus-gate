// Shared settings helpers — used by background.js, gate.js, options.js.
// Classic (non-module) script so it can be loaded with <script src> in
// gate.html/options.html AND with importScripts() in the background
// service worker.

const DEFAULT_PROMPT_MESSAGES = [
  "What if you spent this on finishing the thing you started instead?",
  "No judgment — just checking, is this actually what you want right now?",
  "Is this really worth the one quiet hour you get today?",
  "What could fifteen minutes of real focus get you instead of this?",
  "Could this time go toward fixing the thing you keep avoiding instead?",
  "Is this the best use of your evening?",
  "Will this still matter next week?",
  "Is this site worth the version of you that shows up tomorrow?",
  "What will you have to show for the next twenty minutes on this?",
  "What does the version of you this time next year wish you'd do right now?",
  "Is this really worth the next ten minutes of your life?",
  "Is this a five-minute stop, or the start of an hour you won't notice passing?",
  "Is this the best use of the last hour before bed?",
  "Does this deserve the next chunk of your day?",
  "Is this the best you can do with this hour?",
  "Would ten minutes of stretching serve you better than this?",
  "Does this match the person you say you want to be?",
  "Is this app giving you anything back, or just taking your attention?",
  "Is this habit earning its place in your day?",
  "How will you feel about this an hour from now?",
  "Is this rest, or just numbness dressed up as rest?",
  "What did you open this tab to actually find?",
  "Notice the urge — is it actually yours, or just the app's design working on you?",
  "What will you have to show for the next five minutes on this?",
  "Is this tab something you chose or something you fell into?",
  "Honestly, is this worth what it's costing you elsewhere?",
  "Are you here on purpose, or just out of stress?",
  "Is this the best use of your last ounce of willpower today?",
  "Is this a real choice, or just stress talking?",
  "Is this app a decision or a default?",
  "Is this moving you toward what you actually want?",
  "Is this habit worth interrupting your plans for?",
  "In this exact moment, does this deserve the next few minutes of your life?",
  "What do you actually get out of tonight here?",
  "Is this feed giving you anything back, or just taking your time?",
  "Right now, is this the plan or just the path of least resistance?",
  "What if you spent this on fixing the thing you keep avoiding instead?",
  "Will this be part of the story you tell about this year?",
  "Is this moving you toward the future you're working toward?",
  "Is this moving you toward your goals?",
  "How will you feel about this next week?",
  "What would you tell a friend who was about to do this again?",
  "Could this time be a walk instead?",
  "Would you be okay watching someone you respect do this again?",
  "Is this site worth interrupting your plans for?",
  "Is this the plan, or just the path of least resistance?",
  "Does this get you closer to the life you're building, or further away?",
  "Is this the best use of the only free time you had today?",
  "Is this a brick in the thing you're building, or a distraction from it?",
  "How will you feel about this in a week?",
  "Fair question before you continue — is this adding anything to your day?",
  "Before you tap in, is this worth what it's costing you elsewhere?",
  "Is this how you want to spend this part of your day?",
  "Is this the best use of your attention right now?",
  "Is this a real choice, or just restlessness talking?",
  "Could this time go toward practicing something you care about instead?",
  "Is this scroll something you chose or something you fell into?",
  "Is this site something you'd defend out loud?",
  "Is this tab earning its place in your day?",
  "Is this how you want to spend your one life?",
  "Is this really worth your attention right now?",
  "Is this the version of today you wanted?",
  "What's the one thing you've been putting off instead of this habit?",
  "What if you spent this on getting outside for ten minutes instead?",
  "When did you last drink some water — could this minute go there instead?",
  "Is this a real choice, or just habit talking?",
  "What could an hour of real focus get you instead of this?",
  "Is this the best use of the next ten minutes of your life?",
  "Is this a real choice, or just avoidance talking?",
  "Is this habit the reason you'll feel behind later?",
  "Is this feed something you'd defend out loud?",
  "Could this time go toward planning tomorrow properly instead?",
  "Is this app something you chose or something you fell into?",
  "Before you scroll further, is this what you actually want to be doing?",
  "In this exact moment, is this worth what it's costing you elsewhere?",
  "What if you spent this on reading something worthwhile instead?",
  "Is this feeding the life you're building or just killing time?",
  "What if you spent this on time with the people you love instead?",
  "Is this helping you, or just distracting you?",
  "Is this giving you anything back, or just taking your energy?",
  "Would you have opened this without thinking if there were no prompt at all?",
  "Is this scroll worth the version of you that shows up tomorrow?",
  "Is this feeding your ambition or just killing time?",
  "Is this tab a decision or a default?",
  "Is this feed giving you anything back, or just taking your attention?",
  "What does the version of you a year from now wish you'd do right now?",
  "Is this tab giving you anything back, or just taking your energy?",
  "Is this scroll a decision or a default?",
  "Is this tab worth the version of you that shows up tomorrow?",
  "What would you tell a friend who was about to open this right now?",
  "Is this really worth your weekend?",
  "Is this tab adding up to anything by tonight?",
  "Are you here on purpose, or just out of tiredness?",
  "Just a pause before you go in — does this deserve the next few minutes?",
  "Honestly, does this deserve the next few minutes of your life?",
  "What will you have to show for today on this?",
  "Is this feed the reason you'll feel behind later?",
  "Is your body asking for movement, and this is what it's getting instead?",
  "Ten years from now, will this specific scroll have mattered at all?",
  "Is this scroll worth interrupting your plans for?",
  "Are you here on purpose, or just out of restlessness?",
  "What will you have to show for the next half hour on this?",
  "What could half an hour of real focus get you instead of this?",
  "What if you spent this on the project you keep putting off instead?",
  "What if you spent this on the people who matter to you instead?",
  "Is this really worth the only free time you had today?",
  "Will this matter to you next year?",
  "What do you actually get out of the next twenty minutes here?",
  "Will this still matter next month?",
  "Is this app worth the version of you that shows up tomorrow?",
  "Is this habit something you chose or something you fell into?",
  "Could this time go toward calling someone you miss instead?",
  "Will this matter to you next month?",
  "Is this scroll something you'd defend out loud?",
  "Is this moving you toward your ambition?",
  "Could this time go toward stretching your legs instead?",
  "Is this how you want to spend your evening?",
  "Is this moving you toward your plans?",
  "Are you here on purpose, or just out of loneliness?",
  "Would you be okay watching someone you respect do this?",
  "Is this site adding up to anything by tonight?",
  "What if you spent this on a real conversation instead?",
  "Is this how you want to spend your only free hour today?",
  "Are you here on purpose, or just out of habit?",
  "Is this a real choice, or just autopilot talking?",
  "Is this feeding the version of yourself you respect or just killing time?",
  "Does this get you closer to what you actually want, or further away?",
  "Is this app earning its place in your day?",
  "What does the version of you when you look back on today wish you'd do right now?",
  "Is this a choice, or just a reflex?",
  "Will this matter to you at the end of this week?",
  "Is this moving you toward the thing you actually want?",
  "Will this matter to you this time next year?",
  "Could this time go toward the sleep you need instead?",
  "Is this app adding up to anything by tonight?",
  "What do you actually get out of an hour here?",
  "Does this get you closer to your goals, or further away?",
  "Is this really worth the time you set aside to rest?",
  "What do you actually get out of this session here?",
  "What would you tell a friend who was about to scroll for the next hour?",
  "Is this part of the life you're trying to build?",
  "What's waiting for you that this is letting you avoid?",
  "What could ten minutes of real focus get you instead of this?",
  "Does this get you closer to who you want to be, or further away?",
  "Is this feeding what you actually want or just killing time?",
  "Is this how the people you admire spend their spare time?",
  "In this exact moment, are you here for a reason or just out of habit?",
  "Are you here on purpose, or just out of procrastination?",
  "Totally your call — but is this the choice you'd make with a clear head?",
  "Is this really worth the energy you needed for something better?",
  "Will this still matter by tonight?",
  "Before you scroll further, is this the plan or just the path of least resistance?",
  "Are you choosing this, or is this choosing you?",
  "Right now, are you here for a reason or just out of habit?",
  "Is this how you want to spend your limited time?",
  "Does this get you closer to the version of yourself you respect, or further away?",
  "What if you spent this on your health instead?",
  "Are you here on purpose, or just out of boredom?",
  "In this exact moment, is this the plan or just the path of least resistance?",
  "One honest check before you continue — is this worth it?",
  "Would you be proud to tell someone exactly how you spent the next hour?",
  "What will you have to show for the next fifteen minutes on this?",
  "Could this time go toward a workout instead?",
  "Is this feed a decision or a default?",
  "Is this feeding who you want to be or just killing time?",
  "This is your time to spend — is this really how you want to spend it?",
  "Is this site the reason you'll feel behind later?",
  "Will this matter to you in ten years?",
  "Is this a story future you will be glad you told?",
  "What's the honest reason you're here right now?",
  "What if you spent this on something you'd be proud of instead?",
  "What are you actually trying to become, and does this help?",
  "Does this get you closer to the future you're working toward, or further away?",
  "Right now, is this worth what it's costing you elsewhere?",
  "Is this something you chose, or just something that happened to you?",
  "One more second before you continue — is this what you actually want to be doing?",
  "Is this the tenth scroll of the day, or the first?",
  "Could this time go toward something you'll actually remember instead?",
  "Would you be okay watching someone you respect scroll for the next hour?",
  "Is this feed something you chose or something you fell into?",
  "Is this moving you toward who you want to be?",
  "What will you have to show for tonight on this?",
  "Could this time go toward cooking a real meal instead?",
  "What if you spent this on cooking a real meal instead?",
  "Before you scroll further, does this deserve the next few minutes of your life?",
  "Is this feed worth interrupting your plans for?",
  "Is this really worth your morning?",
  "Before you tap in, are you here for a reason or just out of habit?",
  "Before you scroll further, is this worth what it's costing you elsewhere?",
  "Is this habit something you'd defend out loud?",
  "What will you have to show for an hour on this?",
  "Are your eyes and your neck thanking you for this right now?",
  "Does this get you closer to your ambition, or further away?",
  "Quick gut check — yes because you want to, or yes because it's easy?",
  "Is this a real choice, or just a reflex talking?",
  "Is this the best use of the time you set aside to rest?",
  "Are you here on purpose, or just out of avoidance?",
  "What if you spent this on a skill you keep meaning to learn instead?",
  "If someone summarized your week by your screen time, would you be happy with it?",
  "Is this how you want to spend the next few minutes?",
  "Is this the best use of the energy you needed for something better?",
  "Is this worth remembering, or just worth forgetting?",
  "Is this scroll the reason you'll feel behind later?",
  "What does the version of you next year wish you'd do right now?",
  "Could this time go toward something you'd be proud of instead?",
  "Is this tab something you'd defend out loud?",
  "Is this a real choice, or just boredom talking?",
  "Could this time go toward reading something worthwhile instead?",
  "Could this time go toward writing something down instead?",
  "Is this how you want to spend this precious hour?",
  "What's the one thing you've been putting off instead of scrolling?",
  "Is this moving you toward the life you're building?",
  "How will you feel about this by tonight?",
  "Is this intentional, or just automatic?",
  "Could this time go toward a real conversation instead?",
  "Is this feeding the thing you actually want or just killing time?",
  "Could this time go toward the hobby you dropped instead?",
  "Is this scroll giving you anything back, or just taking your energy?",
  "Is this feeding the person you're trying to become or just killing time?",
  "Future you — proud of this choice, or annoyed?",
  "Is this the best use of an hour you'll never get back?",
  "Is this the habit deciding, or is it you?",
  "Are you actually curious, or just avoiding something else?",
  "What will you have to show for this session on this?",
  "What if you spent this on stretching your legs instead?",
  "Will this still matter an hour from now?",
  "How will you feel about this by the weekend?",
  "What does the version of you at the end of this week wish you'd do right now?",
  "What if you spent this on a workout instead?",
  "Is this moving you toward the person you're trying to become?",
  "Is this scroll giving you anything back, or just taking your time?",
  "Honestly, are you here for a reason or just out of habit?",
  "Is this scroll adding up to anything by tonight?",
  "Will this matter to you a year from now?",
  "Is this the best use of the one quiet hour you get today?",
  "Is this the highlight of your day, or the thing you'll regret later?",
  "Could this time go toward a walk outside instead?",
  "Is this really worth your focus for the rest of the day?",
  "One more second before you continue — is this the plan or just the path of least resistance?",
  "Are you here on purpose, or just out of a reflex?",
  "Is this the rest your body needs, or just more screen?",
  "Is this tab worth interrupting your plans for?",
  "Is this habit a decision or a default?",
  "Does this get you closer to your priorities, or further away?",
  "What could twenty minutes of real focus get you instead of this?",
  "What if you spent this on something you'll actually remember instead?",
  "One more second before you continue — are you here for a reason or just out of habit?",
  "Is this a real choice, or just loneliness talking?",
  "What if you spent this on the sleep you need instead?",
  "What is this actually giving you?",
  "Is this how you want to spend the hours you have today?",
  "What do you actually get out of the next half hour here?",
  "What's the one thing you've been putting off instead of opening this app?",
  "What if you spent this on a walk outside instead?",
  "What's the one thing you've been putting off instead of this exact loop?",
  "How will you feel about this in a year?",
  "Does this get you closer to the person you're trying to become, or further away?",
  "Before you tap in, is this what you actually want to be doing?",
  "Could this time go toward the people who matter to you instead?",
  "One more second before you continue — does this deserve the next few minutes of your life?",
  "Right now, is this what you actually want to be doing?",
  "Honestly, is this the plan or just the path of least resistance?",
  "What does the version of you in ten years wish you'd do right now?",
  "What if you spent this on writing something down instead?",
  "Is this site earning its place in your day?",
  "Is this tab the reason you'll feel behind later?",
  "Is this feeding your goals or just killing time?",
  "Is this feeding the future you're working toward or just killing time?",
  "Would you be okay watching someone you respect check this one more time?",
  "What will you have to show for this scrolling session on this?",
  "How many times today have you already asked yourself this?",
  "Is this the best use of your lunch break?",
  "Is this site a decision or a default?",
  "One more second before you continue — is this worth what it's costing you elsewhere?",
  "What do you actually get out of this scrolling session here?",
  "What does it say that you're back here again so soon?",
  "Is this app giving you anything back, or just taking your time?",
  "Could this time go toward finishing the thing you started instead?",
  "Is this filling you up, or just filling time?",
  "Is this site something you chose or something you fell into?",
  "Is this moving you forward, or just keeping you stuck?",
  "Will this still matter in a week?",
  "Is this feed earning its place in your day?",
  "Could this time go toward a skill you keep meaning to learn instead?",
  "Is this moving you toward the version of yourself you respect?",
  "When did you last move your body today?",
  "What does the version of you five years from now wish you'd do right now?",
  "Is this giving you anything back, or just taking your attention?",
  "What if you spent this on resting properly instead of half-resting here instead?",
  "Is this the best use of your weekend?",
  "What if you spent this on learning the thing you said you'd learn instead?",
  "Would you be okay watching someone you respect open this right now?",
  "What do you actually get out of the next fifteen minutes here?",
  "In this exact moment, is this what you actually want to be doing?",
  "Could this time go toward learning the thing you said you'd learn instead?",
  "Is this feeding your priorities or just killing time?",
  "Is this app giving you anything back, or just taking your energy?",
  "Is this really worth your Sunday?",
  "Is this recharging you, or just numbing you?",
  "If this app disappeared tomorrow, what would you do with this hour instead?",
  "Is this really worth your lunch break?",
  "Is this the best use of your focus for the rest of the day?",
  "What's the one thing you've been putting off instead of checking this again?",
  "What would you tell a friend who was about to check this one more time?",
  "Could this time go toward your health instead?",
  "Will this matter to you when you look back on today?",
  "What triggered this — boredom, a notification, or something you're avoiding?",
  "Is this habit worth the version of you that shows up tomorrow?",
  "Is this feed adding up to anything by tonight?",
  "Before you tap in, is this the plan or just the path of least resistance?",
  "Could this time go toward getting outside for ten minutes instead?",
  "Is this a real choice, or just procrastination talking?",
  "What if you spent this on calling someone you miss instead?",
  "Is this really worth your last ounce of willpower today?",
  "Is this helping your sleep tonight, or costing you sleep?",
  "What does saying yes to this cost you elsewhere?",
  "Could this time go toward resting properly instead of half-resting here instead?",
  "Is this scroll earning its place in your day?",
  "Does this get you closer to your plans, or further away?",
  "What do you actually get out of the next five minutes here?",
  "Is this the best use of your morning?",
  "Before you tap in, does this deserve the next few minutes of your life?",
  "Is this feeding your plans or just killing time?",
  "What if you spent this on the hobby you dropped instead?",
  "Is this really worth the last hour before bed?",
  "Is this really worth your evening?",
  "Could this time go toward time with the people you love instead?",
  "Is this scroll giving you anything back, or just taking your attention?",
  "Will this still matter by the weekend?",
  "Would the you from this morning be glad you're here?",
  "Is this moving you toward your priorities?",
  "Is this app something you'd defend out loud?",
  "How will you feel about this next month?",
  "What's the one thing you've been putting off instead of this?",
  "Is this really worth an hour you'll never get back?",
  "Will this still matter in a year?",
  "How will you feel about this tomorrow?",
  "Are you here on purpose, or just out of autopilot?",
  "Is this habit adding up to anything by tonight?",
  "What if you spent this on planning tomorrow properly instead?",
  "Is this the best use of your Sunday?",
  "Is this app worth interrupting your plans for?",
  "Is this tab giving you anything back, or just taking your attention?",
  "Will this still matter tomorrow?",
  "What would you tell a friend who was about to do this?",
  "Is this a real choice, or just tiredness talking?",
  "What does the version of you next month wish you'd do right now?",
  "Are you scrolling to find something, or just to not feel something?",
  "What if you spent this on the book on your nightstand instead?",
  "Right now, does this deserve the next few minutes of your life?",
  "Is this feed giving you anything back, or just taking your energy?",
  "Is this app the reason you'll feel behind later?",
  "Could this time go toward the project you keep putting off instead?",
  "Before you go further — what were you actually hoping to find here?",
  "Before you scroll further, are you here for a reason or just out of habit?",
  "Is this tab giving you anything back, or just taking your time?",
  "What if you spent this on practicing something you care about instead?",
  "Could this time go toward the book on your nightstand instead?",
  "What do you actually get out of today here?",
  "Will this matter to you five years from now?",
  "Do you actually want this, or are your thumbs just moving on their own?",
  "Honestly, is this what you actually want to be doing?",
  "Is this building something, or just burning time?",
  "Is this feed worth the version of you that shows up tomorrow?",
  "Is this giving you anything back, or just taking your time?",
  "Are you in control of this, or is this app in control of you?",
  "Does this get you closer to the thing you actually want, or further away?",
  "What would change if you closed this right now instead?",
];

// Well-established, non-personal facts about *why* these feeds pull at you
// and what you actually get back — used alongside the personal usage facts
// below so a gauntlet question isn't just guilt, it's grounded in something
// real. Deliberately hedged (no invented statistics) but reflects the
// consistent, broadly-replicated findings on engagement-optimized feeds:
// variable-ratio reward schedules, weak-tie "connection", poor retention
// from passive scrolling, and mood effects of passive use.
const RESEARCH_FACTS = [
  "{site} is built on the same variable-reward pattern as a slot machine — that's what makes it hard to put down, not the content itself.",
  "Most of the 'connection' a feed gives you is weak-tie — people who don't actually know you — not the relationships that actually support you.",
  "Passive scrolling, without posting or replying, is the pattern most consistently linked to feeling worse afterward, and it's most of what a feed like this is built for.",
  "The dopamine hit from {site} habituates fast — each session needs a little more scrolling to feel the same lift it gave you last time.",
  "Feed ranking is optimized for time spent on the app, not for how you'll feel once you close it — those are measured differently, and they diverge.",
  "Whatever you 'learn' from a feed like this is mostly what makes you keep scrolling, not what you'll actually remember tomorrow.",
  "The urge to check {site} 'just in case something happened' is the platform's design working as intended, not a real need.",
  "Endless scroll removes the natural stopping cues your brain uses to decide 'enough' — that's a deliberate design choice, not an accident.",
  "'Staying informed' via a feed mostly means seeing whatever kept other people scrolling — not what's actually important.",
  "Short-form video and infinite feeds are optimized for the next thirty seconds, not for anything you'll carry with you.",
  "The people you actually miss are a phone call or message away, and a feed of strangers isn't a substitute for reaching them.",
  "Notifications and unread badges exploit the same completionist itch as a video game achievement — not an actual need to check.",
  "Studies on passive social media use consistently find it's a poor substitute for the real-world contact it displaces.",
  "The comparison content in most feeds is optimized to be aspirational and unrepresentative — that's why it stings more than it should.",
  "A feed like this rewards you for showing up, not for what you actually got out of showing up.",
  "The 'I'll just check quickly' instinct is the intermittent-reward loop firing — the same mechanism that makes gambling hard to walk away from.",
  "Time spent here rarely shows up later as something you remember; time spent almost anywhere else usually does.",
];

// A site's `mode`:
//  - "work"    — you've marked this site as one you genuinely use for work.
//                Gate: a run of minQuestions–maxQuestions varied deterrent
//                questions (the pool below). Get through all of them ->
//                unlocked for graceMinutes.
//  - "default" — not marked as work (this is what every site starts as).
//                Not a hard block by default: trying to open it runs a
//                longer override gauntlet — overrideMinQuestions–
//                overrideMaxQuestions *varied* questions from the same
//                pool. Say yes every single time -> unlocked for
//                graceMinutes, then it re-locks back to "default" (the
//                override has to be repeated again). notForWorkBehavior
//                can instead make this a flat "block" with no override.
//  - "blocked" — permanently blocked. No prompt, ever, no override. The tab
//                is sent straight to the blocked page.
const DEFAULT_SETTINGS = {
  sites: [
    { id: "instagram", name: "Instagram", hostSuffixes: ["instagram.com"], mode: "default" },
    { id: "reddit", name: "Reddit", hostSuffixes: ["reddit.com", "redd.it"], mode: "default" },
    { id: "youtube", name: "YouTube", hostSuffixes: ["youtube.com", "youtu.be"], mode: "default" }
  ],
  graceMinutes: 5,

  // ---- "work" mode gauntlet ----
  // Before letting you through, the gate asks a run of between minQuestions
  // and maxQuestions deterrent questions (a random count each time), one at
  // a time, each drawn from the pool below without repeats. Answering "no"
  // to any of them blocks immediately. Only getting through all of them
  // unlocks the page.
  minQuestions: 5,
  maxQuestions: 10,
  // A large pool of deterrent lines (~350, covering opportunity cost,
  // identity/goals, future-self, alternatives, habit-loop awareness, health,
  // legacy, and blunt/gentle framings) so the run of questions rarely
  // repeats and can't be memorized/clicked through on autopilot. Replace or
  // extend this from Settings — including with a personalized set generated
  // via the AI prompt template there.
  promptMessages: DEFAULT_PROMPT_MESSAGES,
  promptHint:
    "Getting through all {count} unlocks this page for {minutes} minutes. A new page, or {minutes} minutes passing, starts the questions again.",

  // ---- "default" (not-for-work) mode behavior ----
  // notForWorkBehavior controls what happens on a site you haven't marked
  // as work:
  //  - "override" — not locked forever: a longer run of
  //                 overrideMinQuestions–overrideMaxQuestions *varied*
  //                 questions, drawn from the same promptMessages pool as
  //                 work mode (just more of them). Getting through all of
  //                 them unlocks for graceMinutes, same as "work" mode;
  //                 then it re-locks.
  //  - "block"     — just blocked outright, every time, no questions asked
  //                 and no way through at all (short of marking the site
  //                 as work, or setting it to "Block permanently" instead).
  notForWorkBehavior: "override",
  overrideMinQuestions: 7,
  overrideMaxQuestions: 10,
  overrideHint:
    "Not marked as work, so it's locked by default. Getting through all {count} unlocks it for {minutes} minutes."
};

function fgGetSettings() {
  return chrome.storage.local.get("settings").then((data) => {
    let s = data.settings;
    if (!s) return structuredClone(DEFAULT_SETTINGS);

    s = Object.assign({}, s);

    // Migrate pre-1.2 installs: single promptMessage -> promptMessages pool.
    if (!s.promptMessages && s.promptMessage) {
      s.promptMessages = [s.promptMessage];
    }
    delete s.promptMessage;

    // Migrate pre-1.3 sites: "ask" (old single-mode gate) becomes "default"
    // — since nothing was explicitly marked as used for work, that's the
    // correct new home for it. "blocked" (hard block) carries over as-is.
    if (Array.isArray(s.sites)) {
      s.sites = s.sites.map((site) => {
        const site2 = Object.assign({ mode: "default" }, site);
        if (site2.mode === "ask") site2.mode = "default";
        return site2;
      });
    }

    // merge with defaults so old installs gain new fields
    return Object.assign(structuredClone(DEFAULT_SETTINGS), s);
  });
}

function fgRandomPromptMessage(settings) {
  const pool =
    settings.promptMessages && settings.promptMessages.length
      ? settings.promptMessages
      : DEFAULT_PROMPT_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function fgShuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// "1" -> "1st", "2" -> "2nd", "3" -> "3rd", "11"/"12"/"13" -> "11th" etc.
function fgOrdinal(n) {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// Builds the pool of real, per-question facts a gauntlet can draw from:
// either a fact about *this site, today* (encouraging if today's clean, a
// "you've already spent/opened this" fact if not), or a general research
// fact about why these feeds pull at you and what you don't actually get
// back from them. Every question in a gauntlet gets one of these prepended,
// so it's never just a generic guilt-trip — it's grounded in something
// real, either about the user's own day or about how the site is built.
// Returns { personal: [...], research: [...] } rather than one merged list
// — kept separate so the caller can *guarantee* real personal-usage facts
// show up regularly instead of being drowned out by the (much larger)
// general research pool.
function fgBuildFactPools(factData) {
  const site = (factData && factData.site) || "this site";
  const opens = Math.max(1, (factData && factData.opens) || 1);
  const minutes = Math.max(0, Math.round((factData && factData.minutes) || 0));
  const minutesPlural = minutes === 1 ? "" : "s";
  const ordinal = fgOrdinal(opens);

  const personal = [];

  if (opens <= 1 && minutes <= 0) {
    // Clean day so far — encouraging, not a guilt trip.
    personal.push(
      `You haven't opened ${site} at all today — a clean slate so far.`,
      `Zero minutes on ${site} today. Nothing to undo yet.`,
      `This is your first check-in on ${site} today.`,
      `No time lost to ${site} today — yet.`,
      `Today's been a good day for staying off ${site} so far.`
    );
  } else {
    if (opens > 1) {
      personal.push(
        `This is the ${ordinal} time you've opened ${site} today.`,
        `That's ${opens} separate visits to ${site} today already.`,
        `You've been back to ${site} ${opens} times today.`
      );
    }
    if (minutes > 0) {
      personal.push(
        `You've already spent ${minutes} minute${minutesPlural} on ${site} today.`,
        `${minutes} minute${minutesPlural} of today has already gone to ${site}.`,
        `Today's running total on ${site}: ${minutes} minute${minutesPlural}.`
      );
    }
  }

  const research = RESEARCH_FACTS.map((f) => f.replace(/\{site\}/g, site));

  return { personal, research };
}

// Shared: picks a random gauntlet size within [min, max], then that many
// distinct random questions from the pool (no repeats within one run; if
// the pool is smaller than the count, every question in the pool is used
// once). Returns an array of { fact, question } — question is always the
// pool line (a reflection or a direct question; it's never itself required
// to be yes/no-answerable), and fact (when factData is given) is a real,
// separate fact — personal-usage or research-based — meant to be shown as
// its own line, not glued onto the question. The gate UI adds one fixed
// closing question ("Still want to continue?") that the Yes/No buttons
// actually answer, so the pairing always makes sense regardless of how the
// pool line or fact is phrased.
function fgPickRandomQuestions(settings, min, max, factData) {
  const mn = Math.max(1, min || 5);
  const mx = Math.max(mn, max || 10);
  const count = mn + Math.floor(Math.random() * (mx - mn + 1));

  const basePool =
    settings.promptMessages && settings.promptMessages.length
      ? settings.promptMessages
      : DEFAULT_PROMPT_MESSAGES;

  const pool = fgShuffle(basePool).slice(0, Math.min(count, basePool.length));
  if (!factData) return pool.map((question) => ({ fact: null, question }));

  const { personal, research } = fgBuildFactPools(factData);
  if (!personal.length && !research.length) {
    return pool.map((question) => ({ fact: null, question }));
  }

  // Interleave: question 1 always leads with a real personal-usage fact
  // (when one exists), then alternate personal/research so today's actual
  // numbers keep showing up throughout the run instead of being crowded
  // out by the larger research pool. Falls back to whichever pool is
  // non-empty if one runs out.
  let pIdx = 0;
  let rIdx = 0;
  let shuffledPersonal = fgShuffle(personal);
  let shuffledResearch = fgShuffle(research);

  function nextFrom(kind) {
    if (kind === "personal" && shuffledPersonal.length) {
      if (pIdx >= shuffledPersonal.length) {
        shuffledPersonal = fgShuffle(personal);
        pIdx = 0;
      }
      return shuffledPersonal[pIdx++];
    }
    if (kind === "research" && shuffledResearch.length) {
      if (rIdx >= shuffledResearch.length) {
        shuffledResearch = fgShuffle(research);
        rIdx = 0;
      }
      return shuffledResearch[rIdx++];
    }
    // Requested pool is empty — use whichever one has facts.
    return shuffledPersonal.length ? nextFrom("personal") : nextFrom("research");
  }

  return pool.map((question, i) => {
    const wantPersonal = i % 2 === 0; // question 1, 3, 5... lead with personal
    const fact = nextFrom(wantPersonal ? "personal" : "research");
    return { fact, question };
  });
}

// "work" mode gauntlet: minQuestions–maxQuestions varied questions, each
// carrying a real fact (personal usage today, or research-based).
function fgPickQuestionRun(settings, factData) {
  return fgPickRandomQuestions(settings, settings.minQuestions, settings.maxQuestions, factData);
}

// "default" (not-for-work) override gauntlet: overrideMinQuestions–
// overrideMaxQuestions varied questions from the same pool — typically a
// longer run than work mode, since it's the stronger deterrent.
function fgPickOverrideRun(settings, factData) {
  return fgPickRandomQuestions(
    settings,
    settings.overrideMinQuestions,
    settings.overrideMaxQuestions,
    factData
  );
}

function fgSaveSettings(settings) {
  return chrome.storage.local.set({ settings });
}

function fgSiteNameForUrl(settings, url) {
  return fgSiteForUrl(settings, url).name;
}

// Returns {id, name, mode} — a matching configured site, or a fallback
// built from the hostname if none matches (e.g. a site removed from
// settings after time was already logged against it).
function fgSiteForUrl(settings, url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch (e) {
    return { id: "unknown", name: "this site", mode: "default" };
  }
  for (const site of settings.sites) {
    for (const suffix of site.hostSuffixes) {
      if (host === suffix || host.endsWith("." + suffix)) {
        return { id: site.id, name: site.name, mode: site.mode || "default" };
      }
    }
  }
  return { id: host, name: host, mode: "default" };
}

// Returns the matching site (see fgSiteForUrl), or null if the URL isn't
// on any configured site at all.
function fgFindGatedSite(settings, url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch (e) {
    return null;
  }
  for (const site of settings.sites) {
    for (const suffix of site.hostSuffixes) {
      if (host === suffix || host.endsWith("." + suffix)) return site;
    }
  }
  return null;
}

// ---- Usage stats (time on gated sites, and yes/no decisions) ----
// Stored as chrome.storage.local["stats"][dateKey][siteId] = {name, minutes}
// and chrome.storage.local["decisions"][dateKey] = {yes, no}.

function fgDateKey(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function fgAddTime(siteId, siteName, minutes) {
  const data = await chrome.storage.local.get("stats");
  const stats = data.stats || {};
  const key = fgDateKey();
  if (!stats[key]) stats[key] = {};
  if (!stats[key][siteId]) stats[key][siteId] = { name: siteName, minutes: 0 };
  stats[key][siteId].minutes += minutes;
  stats[key][siteId].name = siteName;
  await chrome.storage.local.set({ stats });
}

// Records that the gate was shown for this site today (i.e. an actual
// attempt to open it), and returns the running count for today — used to
// build the "this is the Nth time you've opened this today" fact. Stored
// separately from the yes/no decision counts below, keyed by site so
// per-site facts are possible.
async function fgRecordSiteOpen(siteId, siteName) {
  const data = await chrome.storage.local.get("opens");
  const opens = data.opens || {};
  const key = fgDateKey();
  if (!opens[key]) opens[key] = {};
  if (!opens[key][siteId]) opens[key][siteId] = { name: siteName, count: 0 };
  opens[key][siteId].count += 1;
  opens[key][siteId].name = siteName;
  await chrome.storage.local.set({ opens });
  return opens[key][siteId].count;
}

// Minutes already logged today for this one site (before this visit).
async function fgGetSiteMinutesToday(siteId) {
  const data = await chrome.storage.local.get("stats");
  const stats = data.stats || {};
  const day = stats[fgDateKey()];
  if (day && day[siteId]) return day[siteId].minutes || 0;
  return 0;
}

async function fgRecordDecision(decision) {
  const data = await chrome.storage.local.get("decisions");
  const decisions = data.decisions || {};
  const key = fgDateKey();
  if (!decisions[key]) decisions[key] = { yes: 0, no: 0 };
  decisions[key][decision] = (decisions[key][decision] || 0) + 1;
  await chrome.storage.local.set({ decisions });
}

// Returns { totalMinutes, perSite: [{id,name,minutes}], days: N }
async function fgGetUsageSummary(days) {
  const data = await chrome.storage.local.get(["stats", "decisions"]);
  const stats = data.stats || {};
  const decisions = data.decisions || {};
  const keys = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(fgDateKey(d));
  }

  const perSiteMap = {};
  let totalMinutes = 0;
  let totalYes = 0;
  let totalNo = 0;

  for (const key of keys) {
    const day = stats[key];
    if (day) {
      for (const siteId of Object.keys(day)) {
        const entry = day[siteId];
        if (!perSiteMap[siteId]) perSiteMap[siteId] = { id: siteId, name: entry.name, minutes: 0 };
        perSiteMap[siteId].minutes += entry.minutes;
        perSiteMap[siteId].name = entry.name;
        totalMinutes += entry.minutes;
      }
    }
    const dec = decisions[key];
    if (dec) {
      totalYes += dec.yes || 0;
      totalNo += dec.no || 0;
    }
  }

  const perSite = Object.values(perSiteMap).sort((a, b) => b.minutes - a.minutes);
  return { totalMinutes, perSite, totalYes, totalNo, days };
}

// Returns [{dateKey, label, totalMinutes}] oldest-first, for a small trend view.
async function fgGetDailyTotals(days) {
  const data = await chrome.storage.local.get("stats");
  const stats = data.stats || {};
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = fgDateKey(d);
    const day = stats[key] || {};
    const total = Object.values(day).reduce((sum, e) => sum + e.minutes, 0);
    out.push({
      dateKey: key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      totalMinutes: total
    });
  }
  return out;
}
