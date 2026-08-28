const supabase = require("../config/supabase");

// ==========================
// OPEN TRADE
// ==========================

async function openTrade(data) {

    try {

        if (!data.tradeKey) {
            console.error("❌ Missing tradeKey");
            return;
        }

        const { data: existingTrade, error: checkError } = await supabase
            .from("trades")
            .select("id")
            .eq("trade_key", data.tradeKey)
            .maybeSingle();

        if (checkError) {
            console.error("❌ Duplicate Check Error:", checkError);
            return;
        }

        if (existingTrade) {
            console.log("⚠ Trade Already Exists:", data.tradeKey);
            return;
        }

        const { error } = await supabase
            .from("trades")
            .insert([{
                trade_key: data.tradeKey,
                trade_id: data.tradeKey,
                market: data.symbol,
                symbol: data.symbol,
                timeframe: data.timeframe,
                strike: data.strike,
                side: data.cmd,
                entry: Number(data.price),
                sl: Number(data.sl),
                tg1: Number(data.tg1),
                points: 0,
                status: "ACTIVE",
                open_time: new Date().toISOString()
            }]);

        if (error) {
            console.error("❌ Open Trade Error:", error);
            return;
        }

        console.log("✅ Trade Saved:", data.tradeKey);

    } catch (err) {

        console.error("❌ openTrade():", err);

    }

}

// ==========================
// CLOSE TRADE
// ==========================

async function closeTrade(data) {

    try {

        if (!data.tradeKey) {
            console.error("❌ Missing tradeKey");
            return;
        }

        let finalStatus = data.status || data.cmd;

        switch (finalStatus) {

            case "TG1_HIT":
                finalStatus = "TARGET HIT";
                break;

            case "SL_HIT":
                finalStatus = "STOP LOSS";
                break;

        }

        const updateData = {

            status: finalStatus,

            close_time: new Date().toISOString()

        };

        // ==========================
        // Calculate Points
        // ==========================

        if (finalStatus === "TARGET HIT") {

            const { data: trade, error: fetchError } = await supabase
            .from("trades")
            .select("entry, tg1")
            .eq("trade_key", data.tradeKey)
            .maybeSingle();

            if (!fetchError && trade) {

                updateData.points =
                    Math.abs(Number(trade.tg1) - Number(trade.entry));

            }

        } else if (data.points !== undefined) {

            updateData.points = Number(data.points);

        }

        const { error } = await supabase
            .from("trades")
            .update(updateData)
            .eq("trade_key", data.tradeKey);

        if (error) {

            console.error("❌ Close Trade Error:", error);

            return;

        }

        console.log("✅ Trade Closed:", data.tradeKey);

    } catch (err) {

        console.error("❌ closeTrade():", err);

    }

}
// ==========================
// SAVE BROKER ORDER
// ==========================

async function saveBrokerOrder(data) {

    try {

        const { error } = await supabase
                .from("broker_orders")
                .upsert(
                    [{

                        trade_key: data.tradeKey,

                        broker_order_id: data.orderId,

                        security_id: data.securityId,

                        exchange_segment: data.exchangeSegment,

                        quantity: Number(data.quantity),

                        product_type: data.productType,

                        status: data.status || "OPEN"

                    }],
                    {
                        onConflict: "trade_key"
                    }
                );

        if (error) {

            console.error("❌ Save Broker Order:", error);

            return;

        }

        console.log("✅ Broker Order Saved");

    } catch (err) {

        console.error("❌ saveBrokerOrder()", err);

    }

}

// ==========================
// GET BROKER ORDER
// ==========================

async function getBrokerOrder(tradeKey) {

    try {

        const { data, error } = await supabase
        .from("broker_orders")
        .select("*")
        .eq("trade_key", tradeKey)
        .maybeSingle();

        if (error) {

            console.error("❌ Get Broker Order:", error);

            return null;

        }

        return data;

    } catch (err) {

        console.error("❌ getBrokerOrder()", err);

        return null;

    }

}

// ==========================
// RESET TRADES
// ==========================

async function resetTrades() {

    try {

        const { error } = await supabase
            .from("trades")
            .delete()
            .gt("id", 0);

        if (error) {

            console.error("❌ Reset Trades Error:", error);
            return false;

        }

        console.log("🧹 All Trades Reset Successfully");

        return true;

    } catch (err) {

        console.error("❌ resetTrades()", err);

        return false;

    }

}

module.exports = {

    openTrade,

    closeTrade,

    saveBrokerOrder,

    getBrokerOrder,

    resetTrades

};