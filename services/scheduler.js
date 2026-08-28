const cron = require("node-cron");
const db = require("../database/db");
const telegramService = require("./telegramService");
const supabase = require("../config/supabase");

// Every day at 3:01 PM IST
cron.schedule(
    "10 15 * * 1-5",
    async () => {
        try {

            const stats = await db.getDashboardStats();

            const message = `
📊 HSK BRAHMASTRA
📅 DAILY REPORT

━━━━━━━━━━━━━━━━━━

✅ Total Trades : ${stats.closedTrades}
🎯 Target Hit  : ${stats.targetHits}
🛑 Stop Loss   : ${stats.stopLosses}
💰 Total Points: ${stats.pnl}
📈 Win Rate    : ${stats.winRate}%

━━━━━━━━━━━━━━━━━━

⚠ DISCLAIMER

• Educational Purpose Only
• We Are Not SEBI Registered
• Trade At Your Own Risk

━━━━━━━━━━━━━━━━━━

🚀 Trade With Discipline
#HSKBRAHMASTRA
`;

            await telegramService.sendMessage(message);

            console.log("✅ Daily Report Sent");

        } catch (err) {

            console.error("❌ Daily Report Error:", err);

        }
    },
    {
        timezone: "Asia/Kolkata"
    }
);

console.log("✅ Daily Report Scheduler Started");

// ======================================
// DAILY RESET - 11:55 PM IST
// ======================================

cron.schedule(
    "55 23 * * 1-5",
    async () => {

        try {

            const { error } = await supabase
            .from("trades")
            .delete()
            .gt("id", 0);

            if (error) throw error;

            await telegramService.sendMessage(
`🧹 HSK BRAHMASTRA

✅ Daily Reset Completed

📅 New Trading Day Ready

━━━━━━━━━━━━━━━━━━

All Trades Cleared
Dashboard Reset Successfully`
            );

            console.log("✅ Daily Reset Completed");

        } catch (err) {

            console.error("❌ Daily Reset Error:", err);

        }

    },
    {
        timezone: "Asia/Kolkata"
    }
);