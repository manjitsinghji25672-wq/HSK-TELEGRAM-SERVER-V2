const supabase = require("../config/supabase");

module.exports = {

    // ==========================
    // DASHBOARD STATS
    // ==========================
    async getDashboardStats(market = "ALL") {

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        
        // Members
        const { count: members, error: memberError } = await supabase
            .from("members")
            .select("*", { count: "exact", head: true });

        if (memberError) throw memberError;

        // Active Trades
        let activeQuery = supabase
            .from("trades")
            .select("*", { count: "exact", head: true })
            .eq("status", "ACTIVE");

        if (market !== "ALL") {
            activeQuery = activeQuery.eq("market", market);
        }   

const { count: activeTrades, error: activeError } = await activeQuery;

        if (activeError) throw activeError;

        // Closed Trades
    let closedQuery = supabase
        .from("trades")
        .select("*", { count: "exact", head: true })
        .neq("status", "ACTIVE")
        .gte("close_time", start.toISOString());

    if (market !== "ALL") {
        closedQuery = closedQuery.eq("market", market);
    }

const { count: closedTrades, error: closedError } = await closedQuery;

        if (closedError) throw closedError;

        // Target Hits
    let targetQuery = supabase
        .from("trades")
        .select("*", { count: "exact", head: true })
        .eq("status", "TARGET HIT")
        .gte("close_time", start.toISOString());

    if (market !== "ALL") {
        targetQuery = targetQuery.eq("market", market);
    }

const { count: targetHits, error: targetError } = await targetQuery;

        if (targetError) throw targetError;

        // Stop Losses
    let stopQuery = supabase
        .from("trades")
        .select("*", { count: "exact", head: true })
        .eq("status", "STOP LOSS")
        .gte("close_time", start.toISOString());

    if (market !== "ALL") {
        stopQuery = stopQuery.eq("market", market);
    }

const { count: stopLosses, error: stopError } = await stopQuery;

        if (stopError) throw stopError;
    // Total Points
    let pointsQuery = supabase
        .from("trades")
        .select("points")
        .neq("status", "ACTIVE")
        .gte("close_time", start.toISOString());

    if (market !== "ALL") {
        pointsQuery = pointsQuery.eq("market", market);
    }

const { data: pointRows, error: pointError } = await pointsQuery;

        if (pointError) throw pointError;

        const totalPoints = (pointRows || []).reduce(
            (sum, row) => sum + Number(row.points || 0),
            0
        );

        const totalCompleted = (targetHits || 0) + (stopLosses || 0);

        const winRate =
            totalCompleted > 0
                ? ((targetHits / totalCompleted) * 100).toFixed(1)
                : "0.0";

        return {
            members: members || 0,
            activeTrades: activeTrades || 0,
            closedTrades: closedTrades || 0,
            targetHits: targetHits || 0,
            stopLosses: stopLosses || 0,
            pnl: totalPoints,
            winRate
        };
    },

    // ==========================
    // ACTIVE TRADES
    // ==========================
    async getActiveTrades() {

        const { data, error } = await supabase
            .from("trades")
            .select(`
                trade_id,
                market,
                side,
                strike,
                entry,
                sl,
                tg1,
                status
            `)
            .eq("status", "ACTIVE")
            .order("open_time", { ascending: false });

        if (error) throw error;

        return data;
    },

    // ==========================
    // CLOSED TRADES
    // ==========================
    async getClosedTrades() {

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from("trades")
            .select(`
                trade_id,
                market,
                side,
                strike,
                entry,
                sl,
                tg1,
                points,
                status,
                close_time
            `)
            .neq("status", "ACTIVE")
            .gte("close_time", start.toISOString())
            .order("close_time", { ascending: false });

        if (error) throw error;

        return data;
    }

};