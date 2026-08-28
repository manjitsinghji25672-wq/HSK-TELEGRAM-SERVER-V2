console.log("✅ Dashboard Loaded");

let allActiveTrades = [];
let allClosedTrades = [];

let currentMarket = "ALL";
let currentClosedMarket = "ALL";
let currentClosedDate = "TODAY";

// ==========================
// SYSTEM SETTINGS
// ==========================

let autoTrading = false;
let paperMode = true;
let lots = 1;

function authHeaders() {

    return {
        "x-session-token": localStorage.getItem("sessionToken")
    };

}

// ==========================
// USER EMAIL
// ==========================

const userEmail = document.getElementById("userEmail");
const email = localStorage.getItem("userEmail");

if (email) {

    userEmail.innerText = email;

} else {

    userEmail.innerText = "Guest User";

}

// ==========================
// LOGOUT
// ==========================

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("userEmail");
    window.location.href = "/login.html";

});

// ==========================
// LOAD SYSTEM SETTINGS
// ==========================

async function loadSettings() {

    try {

        const response = await fetch("/api/settings", {
            headers: authHeaders()
        });

        const result = await response.json();

        const settings = result.settings;

        autoTrading = settings.auto_trading;
        paperMode = settings.paper_mode;
        lots = Number(settings.lots);
        console.log("LOTS =", lots, typeof lots);

        document.getElementById("autoTradingStatus").innerText =
            autoTrading ? "🟢 ON" : "🔴 OFF";

        document.getElementById("paperModeStatus").innerText =
            paperMode ? "📝 PAPER" : "💹 LIVE";

        document.getElementById("lotsStatus").innerText =
            lots;

        console.log("Settings Loaded:", settings);

    } catch (err) {

        console.error("Settings Error:", err);

    }

}

loadSettings();

// ==========================
// LOAD DASHBOARD STATS
// ==========================

async function loadStats() {

    try {

        const response = await fetch("/api/stats", {
            headers: authHeaders()
        });

        if (response.status === 401) {

            localStorage.clear();

            alert("Your account has been logged in from another device.");

            window.location.href = "/login.html";

            return;

        }

        const stats = await response.json();

        document.getElementById("membersCount").innerText = stats.members;
        document.getElementById("signalsCount").innerText = stats.closedTrades;
        document.getElementById("activeTradesCount").innerText = stats.activeTrades;
        document.getElementById("targetHitsCount").innerText = stats.targetHits;
        document.getElementById("stopLossCount").innerText = stats.stopLosses;
        document.getElementById("winRateCount").innerText = stats.winRate + "%";
        document.getElementById("pnlCount").innerText = "₹" + stats.pnl;

    } catch (err) {

        console.error("Dashboard Stats Error:", err);

    }

}

loadStats();

function renderTrades() {

    const tbody = document.getElementById("activeTradesBody");

    tbody.innerHTML = "";

    let filteredTrades = allActiveTrades;

    if (currentMarket !== "ALL") {

        filteredTrades = allActiveTrades.filter(trade =>
            trade.market.startsWith(currentMarket)
        );

    }

    document.getElementById("activeTradesCount").innerText = filteredTrades.length;

    if (filteredTrades.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8">No Active Trades</td>
            </tr>
        `;

        return;
    }

    filteredTrades.forEach(trade => {

    tbody.innerHTML += `
        <tr class="trade-row"
            data-id="${trade.trade_id}"
            data-market="${trade.market}"
            data-side="${trade.side}"
            data-strike="${trade.strike}"
            data-entry="${trade.entry}"
            data-sl="${trade.sl ?? "-"}"
            data-tg1="${trade.tg1 ?? "-"}"
            data-status="${trade.status}">

            <td>${trade.trade_id}</td>
            <td>${trade.market}</td>
            <td>${trade.side}</td>
            <td>${trade.strike}</td>
            <td>${trade.entry}</td>
            <td>${trade.sl ?? "-"}</td>
            <td>${trade.tg1 ?? "-"}</td>
            <td>${trade.status}</td>

        </tr>
    `;

});

attachTradeEvents();

}
// ==========================
// LOAD ACTIVE TRADES
// ==========================

async function loadActiveTrades() {

    try {

        const response = await fetch("/api/trades/active", {
            headers: authHeaders()
        });

        if (response.status === 401) {

            localStorage.clear();

            alert("Your account has been logged in from another device.");

            window.location.href = "/login.html";

            return;
        }

        allActiveTrades = await response.json();

        renderTrades();

    } catch (err) {

        console.error("Active Trades Error:", err);

    }

}
// ==========================
// LOAD CLOSED TRADES
// ==========================

async function loadClosedTrades() {

    try {

        const response = await fetch("/api/trades/closed", {
            headers: authHeaders()
        });

        if (response.status === 401) {

            localStorage.clear();

            alert("Your account has been logged in from another device.");

            window.location.href = "/login.html";

            return;
        }

        allClosedTrades = await response.json();

        renderClosedTrades();

    } catch (err) {

        console.error("Closed Trades Error:", err);

    }

}
// ==========================
// RENDER CLOSED TRADES
// ==========================

    function renderClosedTrades() {

    const tbody = document.getElementById("closedTradesBody");

    tbody.innerHTML = "";

    let filteredTrades = allClosedTrades;

    // Market Filter
    if (currentClosedMarket !== "ALL") {

        filteredTrades = filteredTrades.filter(trade =>
            trade.market.startsWith(currentClosedMarket)
        );

    }

// ==========================
// DATE FILTER
// ==========================

const today = new Date();

filteredTrades = filteredTrades.filter(trade => {

    if (!trade.close_time) return false;

    const tradeDate = new Date(trade.close_time);

    switch (currentClosedDate) {

        case "TODAY":
            return tradeDate.toDateString() === today.toDateString();

        case "YESTERDAY":
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return tradeDate.toDateString() === yesterday.toDateString();

        case "7DAYS":
            const last7 = new Date(today);
            last7.setDate(today.getDate() - 7);
            return tradeDate >= last7;

        case "MONTH":
            return (
                tradeDate.getMonth() === today.getMonth() &&
                tradeDate.getFullYear() === today.getFullYear()
            );

        case "ALL":
        default:
            return true;
    }

});

    if (filteredTrades.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">No Closed Trades</td>
            </tr>
        `;

        return;

    }

    // ==========================
// REPORT SUMMARY BAR
// ==========================

const totalTrades = filteredTrades.length;

const targetHits = filteredTrades.filter(trade =>
    trade.status === "TARGET HIT" ||
    trade.status === "TG1_HIT"
).length;

const stopLoss = filteredTrades.filter(trade =>
    trade.status === "STOP LOSS" ||
    trade.status === "SL_HIT"
).length;

const totalPoints = filteredTrades.reduce((sum, trade) => {

    return sum + Number(trade.points || 0);

}, 0);

document.getElementById("reportTotalTrades").innerText = totalTrades;

document.getElementById("reportTargetHits").innerText = targetHits;

document.getElementById("reportStopLoss").innerText = stopLoss;

document.getElementById("reportTotalPoints").innerText = totalPoints.toFixed(2);

    filteredTrades.forEach(trade => {

        tbody.innerHTML += `
            <tr>
                <td>${trade.trade_id}</td>
                <td>${trade.market}</td>
                <td>${trade.side}</td>
                <td>${trade.entry}</td>
                <td>${trade.points}</td>
                <td>${trade.status}</td>
            </tr>
        `;

    });

}


// ==========================
// MARKET FILTER
// ==========================

document.getElementById("marketFilter").addEventListener("change", function () {

    currentMarket = this.value;

    console.log("Selected:", currentMarket);

    renderTrades();

});

// ==========================
// CLOSED MARKET FILTER
// ==========================

document.getElementById("closedMarketFilter").addEventListener("change", function () {

    currentClosedMarket = this.value;

    renderClosedTrades();

});

// ==========================
// CLOSED DATE FILTER
// ==========================

document.getElementById("closedDateFilter").addEventListener("change", function () {

    currentClosedDate = this.value;

    renderClosedTrades();

});

// ==========================
// AUTO REFRESH (Every 5 Seconds)
// ==========================

setInterval(() => {

    loadStats();

    loadSettings();

    loadActiveTrades();

    loadClosedTrades();

}, 5000);

// ==========================
// TRADE DETAILS MODAL
// ==========================

function attachTradeEvents() {

    document.querySelectorAll(".trade-row").forEach(row => {

        row.onclick = function () {

            document.getElementById("tradeDetails").innerHTML = `
                <b>Trade ID:</b> ${this.dataset.id}<br>
                <b>Market:</b> ${this.dataset.market}<br>
                <b>Side:</b> ${this.dataset.side}<br>
                <b>Strike:</b> ${this.dataset.strike}<br>
                <b>Entry:</b> ${this.dataset.entry}<br>
                <b>SL:</b> ${this.dataset.sl}<br>
                <b>TG1:</b> ${this.dataset.tg1}<br>
                <b>Status:</b> ${this.dataset.status}
            `;

            document.getElementById("tradeModal").style.display = "block";

        };

    });

}

// Close Button
const closeBtn = document.querySelector("#closeModal");

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        document.getElementById("tradeModal").style.display = "none";
    });
}

// Click Outside Modal
window.addEventListener("click", (event) => {
    const modal = document.getElementById("tradeModal");

    if (event.target === modal) {
        modal.style.display = "none";
    }
});



document.getElementById("autoOnBtn").onclick = () => {

    autoTrading = true;

    document.getElementById("autoTradingStatus").innerText = "🟢 ON";

};
document.getElementById("autoOffBtn").onclick = () => {

    autoTrading = false;

    document.getElementById("autoTradingStatus").innerText = "🔴 OFF";

};

document.getElementById("paperOnBtn").onclick = () => {

    paperMode = true;

    document.getElementById("paperModeStatus").innerText = "📝 PAPER";

};

document.getElementById("paperOffBtn").onclick = () => {

    paperMode = false;

    document.getElementById("paperModeStatus").innerText = "💹 LIVE";

};


document.getElementById("plusLotBtn").onclick = () => {

    lots = Number(lots) + 1;

    document.getElementById("lotsStatus").innerText = lots;

};
document.getElementById("minusLotBtn").onclick = () => {

    lots = Number(lots);

    if (lots > 1) {
        lots = lots - 1;
    }

    document.getElementById("lotsStatus").innerText = lots;

};
// ==========================
// SAVE SETTINGS
// ==========================

document.getElementById("saveSettingsBtn").onclick = async () => {

    try {

        const response = await fetch("/api/settings", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
        },

            body: JSON.stringify({

                auto_trading: autoTrading,

                paper_mode: paperMode,

                lots

            })

        });

        const result = await response.json();
        console.log("SETTINGS RESPONSE:", result);

        if (result.success) {

            alert("✅ Settings Saved");

            loadSettings();

        } else {

            alert("❌ Failed");

        }

    } catch (err) {

        console.error(err);

        alert("❌ Error Saving Settings");

    }

};