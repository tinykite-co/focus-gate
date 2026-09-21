(function () {
  const tabs = {
    today: document.getElementById("tabToday"),
    week: document.getElementById("tabWeek"),
    month: document.getElementById("tabMonth")
  };
  const DAYS = { today: 1, week: 7, month: 30 };

  function fmtMinutes(m) {
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h}h ${rem}m` : `${h}h`;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  async function render(range) {
    Object.values(tabs).forEach((b) => b.classList.remove("active"));
    tabs[range].classList.add("active");

    const days = DAYS[range];
    const summary = await fgGetUsageSummary(days);

    document.getElementById("totalTime").textContent = fmtMinutes(summary.totalMinutes);
    document.getElementById("totalCaption").textContent =
      range === "today" ? "spent on gated sites today" : `spent on gated sites over the last ${days} days`;
    document.getElementById("yesCount").textContent = summary.totalYes;
    document.getElementById("noCount").textContent = summary.totalNo;

    const siteList = document.getElementById("siteList");
    siteList.innerHTML = "";
    if (summary.perSite.length === 0) {
      siteList.innerHTML = '<div class="empty">Nothing logged yet.</div>';
    } else {
      const max = Math.max(...summary.perSite.map((s) => s.minutes), 1);
      summary.perSite.forEach((s) => {
        const row = document.createElement("div");
        row.className = "site-row";
        const pct = Math.max(4, Math.round((s.minutes / max) * 100));
        row.innerHTML = `
          <div class="name">${escapeHtml(s.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="minutes">${fmtMinutes(s.minutes)}</div>
        `;
        siteList.appendChild(row);
      });
    }

    const trendSection = document.getElementById("trendSection");
    const dayRow = document.getElementById("dayRow");
    if (range === "today") {
      trendSection.style.display = "none";
    } else {
      trendSection.style.display = "";
      const daily = await fgGetDailyTotals(days > 14 ? 14 : days);
      dayRow.innerHTML = "";
      const maxDay = Math.max(...daily.map((d) => d.totalMinutes), 1);
      daily.forEach((d) => {
        const col = document.createElement("div");
        col.className = "day-col";
        const h = Math.max(2, Math.round((d.totalMinutes / maxDay) * 80));
        col.innerHTML = `
          <div class="col-bar" style="height:${h}px" title="${fmtMinutes(d.totalMinutes)}"></div>
          <div class="col-label">${escapeHtml(d.label)}</div>
        `;
        dayRow.appendChild(col);
      });
    }

    const insightEl = document.getElementById("insightText");
    if (summary.totalMinutes === 0 && summary.totalYes === 0 && summary.totalNo === 0) {
      insightEl.textContent = "No activity logged yet — this fills in as you use Focus Gate.";
    } else {
      const top = summary.perSite[0];
      const totalAsks = summary.totalYes + summary.totalNo;
      const noRate = totalAsks ? Math.round((summary.totalNo / totalAsks) * 100) : 0;
      let text = `You've spent ${fmtMinutes(summary.totalMinutes)} on gated sites`;
      text += range === "today" ? " today" : ` over the last ${days} days`;
      if (top) text += `, mostly on ${top.name} (${fmtMinutes(top.minutes)})`;
      text += `. Of ${totalAsks} prompt${totalAsks === 1 ? "" : "s"}, you said no ${summary.totalNo} time${summary.totalNo === 1 ? "" : "s"}`;
      if (totalAsks > 0) text += ` (${noRate}%)`;
      text += ".";
      insightEl.textContent = text;
    }
  }

  tabs.today.addEventListener("click", () => render("today"));
  tabs.week.addEventListener("click", () => render("week"));
  tabs.month.addEventListener("click", () => render("month"));

  render("today");
})();
