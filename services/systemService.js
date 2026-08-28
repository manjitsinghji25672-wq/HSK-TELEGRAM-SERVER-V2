const supabase = require("../config/supabase");

// ==========================
// GET AUTO TRADING STATUS
// ==========================

async function isAutoTradingEnabled() {

    const { data, error } = await supabase
        .from("system_settings")
        .select("auto_trading")
        .eq("id", 1)
        .single();

    if (error) {
        throw error;
    }

    return data.auto_trading;
}


// ==========================
// ENABLE / DISABLE AUTO TRADING
// ==========================

async function setAutoTrading(status) {

    const { error } = await supabase
        .from("system_settings")
        .update({
            auto_trading: status,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) {
        throw error;
    }

    return true;
}


// ==========================
// ENABLE / DISABLE PAPER MODE
// ==========================

async function setPaperMode(status) {

    const { error } = await supabase
        .from("system_settings")
        .update({
            paper_mode: status,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) {
        throw error;
    }

    return true;
}

// ==========================
// SET CE ENTRY BUFFER
// ==========================

async function setEntryBuffer(buffer) {

    const value = Number(buffer);

    // Allow buffer from -5 to +5
    if (
        !Number.isInteger(value) ||
        value < -5 ||
        value > 5
    ) {
        throw new Error("Buffer must be between -5 and +5");
    }

    const { error } = await supabase
        .from("system_settings")
        .update({
            entry_buffer: value,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) {
        throw error;
    }

    return true;
}

// ==========================
// GET CE ENTRY BUFFER
// ==========================

async function getEntryBuffer() {

    const { data, error } = await supabase
        .from("system_settings")
        .select("entry_buffer")
        .eq("id", 1)
        .single();

    if (error) {
        throw error;
    }

    return Number(data.entry_buffer || 0);
}

// ==========================
// SET TRAILING SL
// ==========================

async function setTrailingJump(value) {

    const trailingJump = Number(value);

    if (
        !Number.isInteger(trailingJump) ||
        trailingJump < 0 ||
        trailingJump > 5
    ) {
        throw new Error(
            "Trailing SL must be between 0 and 5"
        );
    }

    const { error } = await supabase
        .from("system_settings")
        .update({
            trailing_jump: trailingJump,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) {
        throw error;
    }

    return true;
}


// ==========================
// GET TRAILING SL
// ==========================

async function getTrailingJump() {

    const { data, error } = await supabase
        .from("system_settings")
        .select("trailing_jump")
        .eq("id", 1)
        .single();

    if (error) {
        throw error;
    }

    return Number(data.trailing_jump || 0);
}
// ==========================
// GET ORDER MODE
// ==========================

async function getOrderMode() {

    const { data, error } = await supabase
        .from("system_settings")
        .select("order_mode")
        .eq("id", 1)
        .single();

    if (error) {
        throw error;
    }

    return data.order_mode || "LIMIT";
}
// ==========================
// SET ORDER MODE
// ==========================

async function setOrderMode(mode) {

    const value = String(mode).toUpperCase();

    if (!["LIMIT", "MARKET"].includes(value)) {
        throw new Error(
            "Order mode must be LIMIT or MARKET"
        );
    }

    const { data, error } = await supabase
        .from("system_settings")
        .update({
            order_mode: value,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1)
        .select("id, order_mode, updated_at")
        .single();

    if (error) {
        console.error(
            "❌ SET ORDER MODE ERROR:",
            error
        );

        throw error;
    }

    if (!data) {
        throw new Error(
            "Settings row was not updated"
        );
    }

    console.log("================================");
    console.log("✅ ORDER MODE UPDATED");
    console.log("ID         :", data.id);
    console.log("ORDER MODE :", data.order_mode);
    console.log("UPDATED AT :", data.updated_at);
    console.log("================================");

    return data.order_mode;
}
// ==========================
// SET LOTS
// ==========================

async function setLots(lots) {

    const value = Number(lots);

    if (!Number.isInteger(value) || value < 1 || value > 30) {
        throw new Error("Lots must be between 1 and 30");
    }

    const { error } = await supabase
        .from("system_settings")
        .update({
            lots: value,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) {
        throw error;
    }

    console.log("================================");
    console.log("✅ LOTS UPDATED");
    console.log("LOTS :", value);
    console.log("================================");

    return true;
}
// ==========================
// GET MARKET-WISE LOTS
// ==========================

async function getMarketLots() {

    const { data, error } = await supabase
        .from("system_settings")
        .select("market_lots")
        .eq("id", 1)
        .single();

    if (error) {
        throw error;
    }

    return data.market_lots || {};
}


// ==========================
// SET MARKET-WISE LOTS
// ==========================

async function setMarketLots(market, lots) {

    const value = Number(lots);

    if (!Number.isInteger(value) || value < 1 || value > 30) {
        throw new Error("Lots must be between 1 and 30");
    }

    const marketKey = String(market).toUpperCase();

    const allowedMarkets = [
        "NIFTY",
        "BANKNIFTY",
        "SENSEX",
        "CRUDEOIL",
        "CRUDEOIL_MINI",
        "NATURALGAS",
        "NATURALGAS_MINI"
    ];

    if (!allowedMarkets.includes(marketKey)) {
        throw new Error("Invalid market");
    }

    const { data, error } = await supabase
        .from("system_settings")
        .select("market_lots")
        .eq("id", 1)
        .single();

    if (error) {
        throw error;
    }

    const currentLots = data.market_lots || {};

    currentLots[marketKey] = value;

    const { error: updateError } = await supabase
        .from("system_settings")
        .update({
            market_lots: currentLots,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (updateError) {
        throw updateError;
    }

    console.log("================================");
    console.log("✅ MARKET LOTS UPDATED");
    console.log("MARKET :", marketKey);
    console.log("LOTS   :", value);
    console.log("================================");

    return true;
}
// ==========================
// SET 3 WAIT
// ==========================

async function setW3Wait(status) {

    const value = Boolean(status);

    const { error } = await supabase
        .from("system_settings")
        .update({
            w3_wait: value,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) {
        throw error;
    }

    console.log("================================");
    console.log("✅ W3 WAIT UPDATED");
    console.log("W3 WAIT :", value ? "ON" : "OFF");
    console.log("================================");

    return value;
}


// ==========================
// GET W3 WAIT
// ==========================

async function getW3Wait() {

    const { data, error } = await supabase
        .from("system_settings")
        .select("w3_wait")
        .eq("id", 1)
        .single();

    if (error) {
        throw error;
    }

    return data.w3_wait !== false;
}

// ==========================
// GET SETTINGS
// ==========================

async function getSettings() {

    const { data, error } = await supabase
        .from("system_settings")
        .select("*");

    console.log("================================");
    console.log("ALL SETTINGS:", data);
    console.log("ERROR:", error);
    console.log("================================");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("No settings found");
    }

    return data[0];
}

module.exports = {
    
    isAutoTradingEnabled,
    setAutoTrading,
    setPaperMode,

    setEntryBuffer,
    getEntryBuffer,

    setTrailingJump,
    getTrailingJump,

    getOrderMode,
    setOrderMode,

    setLots,

    getMarketLots,
    setMarketLots,

    setW3Wait,
    getW3Wait,

    getSettings

};