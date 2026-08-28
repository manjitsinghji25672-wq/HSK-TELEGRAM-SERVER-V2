require("dotenv").config();
const bot = require("./telegramBot");

const express = require("express");
const { loadInstruments } = require("./optionchain/instrumentLoader");

const axios = require("axios");
const http = require("http");
const path = require("path");
const cors = require("cors");

const config = require("./broker/config");
const supabase = require("./config/supabase");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const webhookRoutes = require("./routes/webhook");
const systemService = require("./services/systemService");

const authMiddleware = require("./middleware/authMiddleware");

const db = require("./database/db");
const { downloadInstrumentFile } = require("./optionchain/instrumentDownloader");
require("./services/scheduler");

const app = express();

const server = http.createServer(app);

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ==============================
// TELEGRAM WEBHOOK
// ==============================

app.use(bot.webhookCallback("/telegram"));

app.use(express.static(path.join(__dirname, "public")));

// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api", dashboardRoutes);
app.use("/webhook", webhookRoutes);



// ==============================
// HEALTH API
// ==============================

app.get("/api/health", (req, res) => {

    res.json({

        status: "ONLINE",

        project: "HSK BRAHMASTRA",

        version: "1.0.0"

    });

});

// =====================================
// RENDER KEEP ALIVE STATUS
// =====================================

app.get("/status", (req, res) => {
    res.status(200).json({
        status: "ONLINE",
        project: "HSK BRAHMAS​​TRA",
        time: new Date().toISOString()
    });
});
// ==============================
// TEST API
// ==============================

app.get("/api/test", (req, res) => {

    res.send("API Working");

});

// ==============================
// SET DHAN STATIC IP
// ==============================

app.get("/api/set-ip", async (req, res) => {

    try {

        const response = await axios.post(
            "https://api.dhan.co/v2/ip/setIP",
            {
                dhanClientId: config.CLIENT_ID,
                ip: "74.220.48.219",
                ipFlag: "PRIMARY"
            },
            {
                headers: {
                    "access-token": config.ACCESS_TOKEN,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }
        );

        res.json(response.data);

    } catch (err) {

        console.error(err.response?.data || err.message);

        res.status(500).json(
            err.response?.data || {
                error: err.message
            }
        );

    }

});

// ==============================
// CHECK DHAN IP STATUS
// ==============================

app.get("/api/check-ip", async (req, res) => {

    try {

        const response = await axios.get(
            "https://api.dhan.co/v2/ip/getIP",
            {
                headers: {
                    "access-token": config.ACCESS_TOKEN,
                    "Accept": "application/json"
                }
            }
        );

        

        res.json(response.data);

    } catch (err) {

        console.error(err.response?.data || err.message);

        res.status(500).json(
            err.response?.data || {
                error: err.message
            }
        );

    }

});

// ==========================
// AUTO TRADING START
// ==========================

app.get("/api/auto/start", async (req, res) => {

    try {

        await systemService.setAutoTrading(true);

        console.log("================================");
        console.log("✅ AUTO TRADING ENABLED");
        console.log("================================");

        res.json({

            success: true,

            autoTrading: true,

            message: "Auto Trading Enabled"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});


// ==========================
// AUTO TRADING STOP
// ==========================

app.get("/api/auto/stop", async (req, res) => {

    try {

        await systemService.setAutoTrading(false);

        console.log("================================");
        console.log("⛔ AUTO TRADING DISABLED");
        console.log("================================");

        res.json({

            success: true,

            autoTrading: false,

            message: "Auto Trading Disabled"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

// ==========================
// AUTO TRADING STATUS
// ==========================

app.get("/api/auto/status", async (req, res) => {

    try {

        const settings =
            await systemService.getSettings();

        res.json({

    success: true,

    autoTrading: settings.auto_trading,

    paperMode: settings.paper_mode,

    lots: settings.lots,

    updatedAt: settings.updated_at

});

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

// ==========================
// GET SETTINGS
// ==========================

app.get("/api/settings", async (req, res) => {

    try {

        const settings = await systemService.getSettings();

        console.log("API SETTINGS:", settings);

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (err) {

        console.error("API SETTINGS ERROR:", err);

        return res.status(500).json({
            error: err.message
        });

    }

});

// ==========================
// UPDATE SETTINGS
// ==========================
// ==========================
// UPDATE SETTINGS
// ==========================

app.post("/api/settings", async (req, res) => {

    try {

        const {
            auto_trading,
            paper_mode,
            lots
        } = req.body;

        const { data, error } = await supabase
            .from("settings")
            .update({
                auto_trading,
                paper_mode,
                lots,
                updated_at: new Date().toISOString()
            })
            .eq("id", 1)
            .select();

        console.log("UPDATED SETTINGS:", data);
        console.log("UPDATE ERROR:", error);

        if (error) {
            throw error;
        }

        res.json({
            success: true
        });

    } catch (err) {

        console.error("SAVE SETTINGS ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


// ==============================
// GET SERVER PUBLIC IP
// ==============================

app.get("/myip", async (req, res) => {

    try {

        const response = await axios.get(
            "https://api.ipify.org?format=json"
        );

        res.json(response.data);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});
const PORT = process.env.PORT || 3001;
// ==============================
// START SERVER
// ==============================

server.listen(PORT, async () => {

    console.log("====================================");
    console.log("🚀 HSK BRAHMASTRA SERVER STARTED");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`❤️ Health : http://localhost:${PORT}/api/health`);

    // ==========================
// DOWNLOAD + LOAD LATEST INSTRUMENT FILE
// ==========================

try {

    console.log("📥 Updating Dhan Instrument Master...");

    await loadInstruments();

    console.log("✅ Dhan Instrument Master Ready");

} catch (err) {

    console.log(
        "❌ Instrument Master Failed:",
        err.message
    );

}

    // ==========================
    // SUPABASE CONNECTION
    // ==========================

    try {

        const { error } = await supabase
            .from("members")
            .select("id")
            .limit(1);

        if (error) {

            console.log("❌ Supabase Error:", error.message);

        } else {

            console.log("✅ Supabase Connected Successfully");

        }

    } catch (err) {

        console.log("❌ Connection Failed:", err.message);

    }

    // ==========================
    // TELEGRAM WEBHOOK
    // ==========================

    try {

        await bot.telegram.setWebhook(
            "https://hsk-telegram-server.onrender.com/telegram"
        );

        console.log("✅ Telegram Webhook Set");

    } catch (err) {

        console.log("❌ Telegram Webhook Error:", err.message);

    }

    console.log("====================================");

});

// ==========================
// ACTIVE TRADES API
// ==========================

app.get("/api/trades/active", authMiddleware, async (req, res) => {

    try {

        const trades = await db.getActiveTrades();

        res.json(trades);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to load active trades"
        });

    }

});
// ==========================
// SEND DAILY REPORT NOW
// ==========================

app.get("/api/report/send", async (req, res) => {

    try {

        const market = req.query.market || "ALL";

        const stats = await db.getDashboardStats(market);

        const message = `
📊 HSK BRAHMASTRA
📅 DAILY REPORT
📌 Symbol : ${market}

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

        const telegramService = require("./services/telegramService");

        await telegramService.sendMessage(message);

        res.json({
            success: true,
            message: "Daily Report Sent Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// ==========================
// CLOSED TRADES API
// ==========================

app.get("/api/trades/closed", authMiddleware, async (req, res) => {

    try {

        const trades = await db.getClosedTrades();

        res.json(trades);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to load closed trades"
        });

    }

});
