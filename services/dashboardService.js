const supabase = require("../config/supabase");

// ==========================
// TODAY REPORT
// ==========================

async function getTodayReport() {

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from("trades")
        .select("*")
        .neq("status", "ACTIVE")
        .gte("close_time", start.toISOString())
        .order("close_time", { ascending: false });

    if (error) throw error;

    return data;
}

// ==========================
// DASHBOARD STATS
// ==========================

async function getDashboardStats() {

    // Members
    const { count: members } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true });

    // Active Trades
    const { count: activeTrades } = await supabase
        .from("trades")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");

    // Closed Trades
    const { data: closedTrades } = await supabase
        .from("trades")
        .select("status,points")
        .neq("status", "ACTIVE");

    const totalClosed = closedTrades.length;

    const targetHits = closedTrades.filter(
        t => t.status === "TARGET HIT"
    ).length;

    const stopLosses = closedTrades.filter(
        t => t.status === "STOP LOSS"
    ).length;

    const pnl = closedTrades.reduce(
        (sum, t) => sum + Number(t.points || 0),
        0
    );

    const winRate =
        totalClosed === 0
            ? 0
            : ((targetHits / totalClosed) * 100).toFixed(1);

    return {

        members: members || 0,

        activeTrades: activeTrades || 0,

        closedTrades: totalClosed,

        targetHits,

        stopLosses,

        winRate,

        pnl

    };

}

module.exports = {

    getTodayReport,

    getDashboardStats

};