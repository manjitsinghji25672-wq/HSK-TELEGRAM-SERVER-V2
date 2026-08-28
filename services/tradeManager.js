// ======================================
// HSK BRAHMASTRA TRADE MANAGER
// ======================================

const activeTrades = new Map();

// ----------------------------
// OPEN TRADE
// ----------------------------

function openTrade(data) {

    activeTrades.set(data.tradeKey, data);

    console.log("🟢 Trade Opened:", data.tradeKey);

}

// ----------------------------
// UPDATE TRADE
// ----------------------------

function updateTrade(data) {

    if (!activeTrades.has(data.tradeKey))
        return;

    const trade = activeTrades.get(data.tradeKey);

    Object.assign(trade, data);

    activeTrades.set(data.tradeKey, trade);

    console.log("🟡 Trade Updated:", data.tradeKey);

}

// ----------------------------
// CLOSE TRADE
// ----------------------------

function closeTrade(data) {

    if (!activeTrades.has(data.tradeKey))
        return;

    activeTrades.delete(data.tradeKey);

    console.log("🔴 Trade Closed:", data.tradeKey);

}

// ----------------------------

module.exports = {

    openTrade,
    updateTrade,
    closeTrade,
    activeTrades

};