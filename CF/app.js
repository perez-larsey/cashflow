/* ---- STATE ---- */
let entries = JSON.parse(localStorage.getItem("cf_entries") || "[]");
let sessions = JSON.parse(localStorage.getItem("cf_sessions") || "[]");
let currentSession = localStorage.getItem("cf_current_session") || "Current Period";
let selectedType = "income";
let chart = null;

/* ---- ELEMENTS ---- */
const totalIncomeEl   = document.getElementById("totalIncome");
const totalExpenseEl  = document.getElementById("totalExpense");
const balanceEl       = document.getElementById("balance");
const entryList       = document.getElementById("entryList");
const descInput       = document.getElementById("descInput");
const amountInput     = document.getElementById("amountInput");
const categoryInput   = document.getElementById("categoryInput");
const addBtn          = document.getElementById("addBtn");
const clearBtn        = document.getElementById("clearBtn");
const hamburger       = document.getElementById("hamburger");
const sidebar         = document.getElementById("sidebar");
const overlay         = document.getElementById("overlay");
const sidebarClose    = document.getElementById("sidebarClose");
const sessionsList    = document.getElementById("sessionsList");
const saveSessionBtn  = document.getElementById("saveSessionBtn");
const saveSessionForm = document.getElementById("saveSessionForm");
const sessionNameInput= document.getElementById("sessionNameInput");
const confirmSaveBtn  = document.getElementById("confirmSaveBtn");
const cancelSaveBtn   = document.getElementById("cancelSaveBtn");
const currentSessionLabel = document.getElementById("currentSessionLabel");
const topSessionBadge = document.getElementById("topSessionBadge");
const sessionSubtitle = document.getElementById("sessionSubtitle");
const personalityTypeEl = document.getElementById("personalityType");
const personalityReactionEl = document.getElementById("personalityReaction");
const badgeRow = document.getElementById("badgeRow");

let unlockedBadges = JSON.parse(localStorage.getItem("cf_badges") || "[]");

const badgeDefinitions = [
  {
    id: "first-move",
    title: "First Move",
    desc: "Add your first transaction.",
    condition: (income, expense, entries) => entries.length > 0
  },
  {
    id: "steady-saver",
    title: "Steady Saver",
    desc: "Spend 30% or less of income.",
    condition: (income, expense, entries) => income > 0 && entries.length >= 3 && expense / income <= 0.3
  },
  {
    id: "balanced-budget",
    title: "Balanced Budget",
    desc: "Keep spending between 30% and 70% of income.",
    condition: (income, expense, entries) => income > 0 && entries.length >= 3 && expense / income > 0.3 && expense / income <= 0.7
  },
  {
    id: "spender-spark",
    title: "Spender Spark",
    desc: "More than 70% of income goes to expenses.",
    condition: (income, expense, entries) => income > 0 && entries.length >= 3 && expense / income > 0.7
  },
  {
    id: "session-saver",
    title: "Session Saver",
    desc: "Save a period to archive your progress.",
    condition: (income, expense, entries, sessions) => sessions.length > 0
  }
];

/* ---- SIDEBAR / NAV ---- */
function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("active");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
}

hamburger.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

document.querySelectorAll(".nav-item").forEach(link => {
  link.addEventListener("click", (e) => {
    document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    if (window.innerWidth <= 768) closeSidebar();
  });
});

/* ---- TYPE TOGGLE ---- */
document.querySelectorAll(".type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedType = btn.dataset.type;
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active-type"));
    btn.classList.add("active-type");
  });
});

/* ---- ADD ENTRY ---- */
addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  if (!desc || isNaN(amount) || amount <= 0) {
    shake(addBtn);
    return;
  }

  entries.unshift({
    id: Date.now(),
    type: selectedType,
    desc,
    amount,
    category,
    date: new Date().toLocaleDateString("en-GB")
  });

  save();
  descInput.value = "";
  amountInput.value = "";
  render();
});

/* ---- CLEAR ALL ---- */
clearBtn.addEventListener("click", () => {
  if (confirm("Clear all transactions in the current period?")) {
    entries = [];
    save();
    render();
  }
});

/* ---- SAVE SESSION ---- */
saveSessionBtn.addEventListener("click", () => {
  if (entries.length === 0) {
    alert("No transactions to save. Add some entries first.");
    return;
  }
  saveSessionForm.classList.add("visible");
  sessionNameInput.focus();
});

cancelSaveBtn.addEventListener("click", () => {
  saveSessionForm.classList.remove("visible");
  sessionNameInput.value = "";
});

confirmSaveBtn.addEventListener("click", () => {
  const name = sessionNameInput.value.trim();
  if (!name) {
    shake(sessionNameInput);
    return;
  }

  const income = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  const session = {
    id: Date.now(),
    name,
    savedAt: new Date().toLocaleDateString("en-GB"),
    income,
    expense,
    balance: income - expense,
    count: entries.length,
    entries: [...entries]
  };

  sessions.unshift(session);
  localStorage.setItem("cf_sessions", JSON.stringify(sessions));

  entries = [];
  currentSession = "New Period";
  localStorage.setItem("cf_current_session", currentSession);
  save();

  saveSessionForm.classList.remove("visible");
  sessionNameInput.value = "";

  render();
  renderSessions();
  updateSessionLabel();
});

/* ---- STORAGE ---- */
function save() {
  localStorage.setItem("cf_entries", JSON.stringify(entries));
}

/* ---- SHAKE ANIMATION ---- */
function shake(el) {
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "shake 0.35s ease";
  setTimeout(() => el.style.animation = "", 400);
}

/* ---- RENDER ---- */
function render() {
  const income  = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const balance = income - expense;

  totalIncomeEl.textContent  = `GH₵ ${income.toFixed(2)}`;
  totalExpenseEl.textContent = `GH₵ ${expense.toFixed(2)}`;
  balanceEl.textContent      = `GH₵ ${balance.toFixed(2)}`;
  balanceEl.style.color      = balance >= 0 ? "var(--green)" : "var(--red)";

  renderPersonality(income, expense, entries);
  renderList();
  renderChart();
}

function renderList() {
  if (entries.length === 0) {
    entryList.innerHTML = `<div class="empty-msg">No transactions yet. Add one above.</div>`;
    return;
  }

  entryList.innerHTML = entries.map(e => `
    <div class="entry-item ${e.type}" data-id="${e.id}">
      <div class="entry-info">
        <span class="entry-desc">${e.desc}</span>
        <span class="entry-meta">${e.category} · ${e.date}</span>
      </div>
      <div class="entry-right">
        <span class="entry-amount">${e.type === "income" ? "+" : "−"} GH₵ ${e.amount.toFixed(2)}</span>
        <button class="del-btn" data-id="${e.id}" title="Delete">×</button>
      </div>
    </div>`).join("");

  entryList.querySelectorAll(".del-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      entries = entries.filter(e => e.id !== Number(btn.dataset.id));
      save();
      render();
    });
  });
}

function renderChart() {
  const cats = {};
  entries.filter(e => e.type === "expense").forEach(e => {
    cats[e.category] = (cats[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(cats);
  const data = Object.values(cats);
  const colors = ["#22c55e","#16a34a","#4ade80","#86efac","#15803d","#dcfce7","#bbf7d0","#6ee7b7"];
  const ctx = document.getElementById("pieChart").getContext("2d");
  const emptyEl = document.getElementById("chartEmpty");

  if (chart) { chart.destroy(); chart = null; }

  if (labels.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#6b7a6b",
            font: { family: "Outfit", size: 11 },
            padding: 10,
            boxWidth: 10,
            borderRadius: 3
          }
        }
      },
      cutout: "62%"
    }
  });
}

function getPersonality(income, expense, entries) {
  if (entries.length === 0) {
    return {
      label: "Awaiting Story",
      reaction: "Add your first transaction to reveal your cash personality and begin unlocking badges."
    };
  }

  if (income <= 0) {
    return {
      label: "Fresh Start",
      reaction: "You have expenses but no income yet. Add income to balance the story."
    };
  }

  const ratio = expense / income;
  if (ratio <= 0.3) {
    return {
      label: "Saver",
      reaction: "Your cash feels calm and collected. Keep building that growing cushion."
    };
  }

  if (ratio <= 0.7) {
    return {
      label: "Balanced",
      reaction: "Your spending has a good rhythm. Stay steady and watch the story unfold."
    };
  }

  return {
    label: "Spender",
    reaction: "You’re in spend mode. A few smart choices will make this narrative even stronger."
  };
}

function getBadgeStates(income, expense, entries, sessions) {
  const activeIds = badgeDefinitions.filter(b => b.condition(income, expense, entries, sessions)).map(b => b.id);
  const newUnlocked = activeIds.filter(id => !unlockedBadges.includes(id));
  if (newUnlocked.length > 0) {
    unlockedBadges = [...unlockedBadges, ...newUnlocked];
    localStorage.setItem("cf_badges", JSON.stringify(unlockedBadges));
  }

  return badgeDefinitions.map(b => ({
    ...b,
    unlocked: unlockedBadges.includes(b.id),
    active: activeIds.includes(b.id)
  }));
}

function renderPersonality(income, expense, entries) {
  if (!personalityTypeEl || !personalityReactionEl || !badgeRow) return;

  const personality = getPersonality(income, expense, entries);
  personalityTypeEl.textContent = personality.label;
  personalityReactionEl.textContent = personality.reaction;

  const badges = getBadgeStates(income, expense, entries, sessions);
  badgeRow.innerHTML = badges.map(b => `
    <div class="personality-badge ${b.unlocked ? "unlocked" : "locked"} ${b.active ? "active-badge" : ""}" title="${b.desc}">
      <span>${b.title}</span>${b.unlocked ? "" : "<small>locked</small>"}
    </div>
  `).join("");
}

/* ---- SESSIONS UI ---- */
function renderSessions() {
  if (sessions.length === 0) {
    sessionsList.innerHTML = `<div class="no-sessions">No saved sessions yet.<br>Save your current period to archive it here.</div>`;
    return;
  }

  sessionsList.innerHTML = sessions.map(s => `
    <div class="session-card" data-id="${s.id}">
      <div class="session-card-info">
        <span class="session-card-name">${s.name}</span>
        <span class="session-card-meta">Saved ${s.savedAt} · ${s.count} transaction${s.count !== 1 ? "s" : ""}</span>
      </div>
      <div class="session-card-stats">
        <div class="session-stat">
          <span class="session-stat-label">Income</span>
          <span class="session-stat-val green">GH₵ ${s.income.toFixed(2)}</span>
        </div>
        <div class="session-stat">
          <span class="session-stat-label">Expense</span>
          <span class="session-stat-val red">GH₵ ${s.expense.toFixed(2)}</span>
        </div>
        <div class="session-stat">
          <span class="session-stat-label">Net</span>
          <span class="session-stat-val ${s.balance >= 0 ? "green" : "red"}">GH₵ ${s.balance.toFixed(2)}</span>
        </div>
        <button class="session-del-btn" data-id="${s.id}" title="Delete session">×</button>
      </div>
    </div>`).join("");

  sessionsList.querySelectorAll(".session-del-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("Delete this saved session? This cannot be undone.")) {
        sessions = sessions.filter(s => s.id !== Number(btn.dataset.id));
        localStorage.setItem("cf_sessions", JSON.stringify(sessions));
        renderSessions();
      }
    });
  });
}

function updateSessionLabel() {
  const label = currentSession || "Current Period";
  currentSessionLabel.textContent = label;
  topSessionBadge.textContent = label;
  if (sessionSubtitle) sessionSubtitle.textContent = label;
}

/* ---- SHAKE KEYFRAME ---- */
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-5px); }
    40%     { transform: translateX(5px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);

/* ---- INIT ---- */
updateSessionLabel();
render();
renderSessions();