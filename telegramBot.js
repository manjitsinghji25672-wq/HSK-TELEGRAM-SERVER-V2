require("dotenv").config();

const { Telegraf, Markup } = require("telegraf");
const {
    setOrderMode
} = require("./routes/orderMode");

const systemService = require("./services/systemService");
const supabase = require("./config/supabase");
const bot = new Telegraf(process.env.BOT_TOKEN);

const tradeService = require("./services/tradeService");
// ==========================
// START
// ==========================

bot.command("starttrade", async (ctx) => {

    try {

        await systemService.setAutoTrading(true);

        await ctx.reply(
`🟢 AUTO TRADING ENABLED

🤖 Broker : DHAN
📈 Status : ACTIVE

━━━━━━━━━━━━━━━━━━

✅ Database Updated Successfully`
        );

        console.log("✅ Auto Trading Enabled");

    } catch (err) {

        console.error(err);

        await ctx.reply(`❌ ${err.message}`);

    }

});

// ==========================
// STOP
// ==========================

bot.command("stoptrade", async (ctx) => {

    try {

        await systemService.setAutoTrading(false);

        await ctx.reply(
`🔴 AUTO TRADING DISABLED

🤖 Broker : DHAN
📉 Status : STOPPED

━━━━━━━━━━━━━━━━━━

✅ Database Updated Successfully`
        );

        console.log("⛔ Auto Trading Disabled");

    } catch (err) {

        console.error(err);

        await ctx.reply(`❌ ${err.message}`);

    }

});

// ==========================
// PAPER MODE
// ==========================

bot.command("paper", async (ctx) => {

    try {

        await systemService.setPaperMode(true);

        await ctx.reply(
`📝 PAPER MODE ENABLED

🤖 Broker : DHAN
📊 Mode   : PAPER

━━━━━━━━━━━━━━━━━━

✅ No Real Broker Orders
📝 Paper Trading Active`
        );

        console.log("📝 Paper Mode Enabled");

    } catch (err) {

        console.error(err);

        await ctx.reply(`❌ ${err.message}`);

    }

});
// ==========================
// LIVE MODE
// ==========================

bot.command("live", async (ctx) => {

    try {

        await systemService.setPaperMode(false);

        await ctx.reply(
`🔴 LIVE MODE ENABLED

🤖 Broker : DHAN
⚠️ Mode   : LIVE

━━━━━━━━━━━━━━━━━━

🚨 REAL BROKER ORDERS ENABLED
⚠️ Trade Carefully`
        );

        console.log("🔴 Live Mode Enabled");

    } catch (err) {

        console.error(err);

        await ctx.reply(`❌ ${err.message}`);

    }

});

// ==========================
// ENTRY BUFFER
// ==========================

bot.command("buffer", async (ctx) => {

    try {

        const args = ctx.message.text.trim().split(/\s+/);

        // /buffer -> show current buffer
        if (args.length === 1) {

            const settings =
                await systemService.getSettings();

            const buffer =
                Number(settings.entry_buffer || 0);

            const displayBuffer =
                buffer === 0
                    ? "🔴 OFF"
                    : buffer > 0
                        ? `🟢 +₹${buffer}`
                        : `🔴 -₹${Math.abs(buffer)}`;

            await ctx.reply(
`📊 HSK BRAHM||||BRAHMASTRA

━━━━━━━━━━━━━━━━━━
📈 CE / PE LIMIT BUFFER

💰 Current Buffer : ${displayBuffer}
━━━━━━━━━━━━━━━━━━

Positive Buffer:

/buffer 0 → OFF
/buffer 1 → +₹1
/buffer 2 → +₹2
/buffer 3 → +₹3
/buffer 4 → +₹4
/buffer 5 → +₹5

Negative Buffer:

/buffer -1 → -₹1
/buffer -2 → -₹2
/buffer -3 → -₹3
/buffer -4 → -₹4
/buffer -5 → -₹5

━━━━━━━━━━━━━━━━━━`
            );

            return;
        }

        const buffer = Number(args[1]);

        // Allow only whole-number buffer from -5 to +5
        if (
            !Number.isInteger(buffer) ||
            buffer < -5 ||
            buffer > 5
        ) {

            await ctx.reply(
`❌ INVALID BUFFER

Allowed range:

-5 = -₹5
-4 = -₹4
-3 = -₹3
-2 = -₹2
-1 = -₹1
 0 = OFF
 1 = +₹1
 2 = +₹2
 3 = +₹3
 4 = +₹4
 5 = +₹5`
            );

            return;
        }

        await systemService.setEntryBuffer(buffer);

        const status =
            buffer === 0
                ? "🔴 OFF"
                : buffer > 0
                    ? `🟢 +₹${buffer}`
                    : `🔴 -₹${Math.abs(buffer)}`;

        await ctx.reply(
`✅ BUFFER UPDATED

━━━━━━━━━━━━━━━━━━

📈 CE / PE LIMIT BUFFER
💰 Buffer : ${status}

━━━━━━━━━━━━━━━━━━

🎯 CE / PE LIMIT Entry
🛑 SL / TG unchanged

━━━━━━━━━━━━━━━━━━

Dhan Entry Buffer Updated`
        );

        console.log(
    `✅ CE / PE Entry Buffer Set: ₹${buffer}`
);

    } catch (err) {

        console.error(err);

        await ctx.reply(
            `❌ BUFFER UPDATE FAILED\n\n${err.message}`
        );

    }

});

// ==========================
// TRAILING STOP LOSS
// ==========================

bot.command("tsl", async (ctx) => {

    try {

        const args =
            ctx.message.text.trim().split(/\s+/);

        // /tsl → show current setting
        if (args.length === 1) {

            const trailingJump =
                await systemService.getTrailingJump();

            const status =
                trailingJump === 0
                    ? "🔴 OFF"
                    : `🟢 ${trailingJump} POINT${trailingJump > 1 ? "S" : ""}`;

            await ctx.reply(
`🤖 HSK BRAHMĀSTRA

━━━━━━━━━━━━━━━━━━

📉 TRAILING STOP LOSS

Current : ${status}

━━━━━━━━━━━━━━━━━━

/tsl off → OFF
/tsl 1   → 1 Point
/tsl 2   → 2 Points
/tsl 3   → 3 Points
/tsl 4   → 4 Points
/tsl 5   → 5 Points

━━━━━━━━━━━━━━━━━━`
            );

            return;
        }

        const value =
            args[1].toLowerCase();

        // OFF
        if (value === "off") {

            await systemService.setTrailingJump(0);

            await ctx.reply(
`✅ TRAILING SL UPDATED

━━━━━━━━━━━━━━━━━━

📉 Trailing SL : 🔴 OFF
📊 Trailing Jump : 0

━━━━━━━━━━━━━━━━━━`
            );

            return;
        }

        const trailingJump =
            Number(value);

        if (
            !Number.isInteger(trailingJump) ||
            trailingJump < 1 ||
            trailingJump > 5
        ) {

            await ctx.reply(
`❌ INVALID TRAILING SL

Allowed:

/tsl off
/tsl 1
/tsl 2
/tsl 3
/tsl 4
/tsl 5`
            );

            return;
        }

        await systemService.setTrailingJump(
            trailingJump
        );

        await ctx.reply(
`✅ TRAILING SL UPDATED

━━━━━━━━━━━━━━━━━━

📉 Trailing SL : 🟢 ON
📊 Trailing Jump : ${trailingJump} Point${trailingJump > 1 ? "s" : ""}

━━━━━━━━━━━━━━━━━━`
        );

        console.log(
            `✅ Trailing SL Set: ${trailingJump}`
        );

    } catch (err) {

        console.error(
            "❌ TRAILING SL ERROR:",
            err
        );

        await ctx.reply(
            `❌ TRAILING SL UPDATE FAILED\n\n${err.message}`
        );
    }

});

// ==========================
// MEMBER JOIN
// ==========================

bot.command("join", async (ctx) => {

    try {

        const telegramId =
            String(ctx.from.id);

        const name =
            ctx.from.first_name ||
            ctx.from.username ||
            "Member";

        // ==========================
        // CHECK EXISTING MEMBER
        // ==========================

        const { data: existing, error: checkError } =
            await supabase
                .from("members")
                .select("id, name, status")
                .eq("telegram_id", telegramId)
                .maybeSingle();

        if (checkError) {
            throw checkError;
        }

        if (existing) {

            await ctx.reply(
`🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

👤 Member : ${existing.name}

🆔 Telegram ID : ${telegramId}

📊 Status : ${existing.status}

━━━━━━━━━━━━━━━━━━

You are already registered.`
            );

            return;
        }

        // ==========================
        // CREATE MEMBER
        // ==========================

        const { error } =
            await supabase
                .from("members")
                .insert({

                    telegram_id: telegramId,

                    name,

                    role: "MEMBER",

                    status: "PENDING",

                    lots: 1,

                    dhan_connected: false

                });

        if (error) {
            throw error;
        }

        await ctx.reply(
`🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

✅ REGISTRATION RECEIVED

👤 Member : ${name}

🆔 Telegram ID :
${telegramId}

⏳ Status : PENDING

━━━━━━━━━━━━━━━━━━

Your request has been sent
for ADMIN approval.

Please wait for approval.`
        );

        console.log(
            "✅ New Member Registration:",
            telegramId,
            name
        );

    } catch (err) {

        console.error(
            "❌ MEMBER JOIN ERROR:",
            err
        );

        await ctx.reply(
            `❌ REGISTRATION FAILED\n\n${err.message}`
        );

    }

});

// ==========================
// MEMBER APPROVE
// ==========================

bot.command("approve", async (ctx) => {

    try {

        const args =
            ctx.message.text.trim().split(/\s+/);

        // /approve <telegram_id>
        if (args.length !== 2) {

            await ctx.reply(
                "❌ Usage:\n\n/approve TELEGRAM_ID"
            );

            return;
        }

        const targetTelegramId =
            String(args[1]);

        const adminTelegramId =
            String(ctx.from.id);

        // ==========================
        // CHECK ADMIN
        // ==========================

        const { data: admin, error: adminError } =
            await supabase
                .from("members")
                .select("id, name, role, status")
                .eq("telegram_id", adminTelegramId)
                .eq("role", "ADMIN")
                .eq("status", "ACTIVE")
                .maybeSingle();

        if (adminError) {
            throw adminError;
        }

        if (!admin) {

            await ctx.reply(
                "❌ ACCESS DENIED\n\nOnly ACTIVE ADMIN can approve members."
            );

            return;
        }

        // ==========================
        // FIND PENDING MEMBER
        // ==========================

        const { data: member, error: memberError } =
            await supabase
                .from("members")
                .select("id, name, role, status, telegram_id, lots")
                .eq("telegram_id", targetTelegramId)
                .eq("role", "MEMBER")
                .eq("status", "PENDING")
                .maybeSingle();

        if (memberError) {
            throw memberError;
        }

        if (!member) {

            await ctx.reply(
                `❌ MEMBER NOT FOUND

Telegram ID:
${targetTelegramId}

Only PENDING MEMBER can be approved.`
            );

            return;
        }

        // ==========================
        // APPROVE MEMBER
        // ==========================

        const { error: updateError } =
            await supabase
                .from("members")
                .update({
                    status: "ACTIVE"
                })
                .eq("id", member.id);

        if (updateError) {
            throw updateError;
        }

        // ==========================
        // ADMIN CONFIRMATION
        // ==========================

        await ctx.reply(
`🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

✅ MEMBER APPROVED

👤 Member : ${member.name}

🆔 Telegram ID :
${targetTelegramId}

📊 Status : ACTIVE

📦 Lots : ${member.lots || 1}

━━━━━━━━━━━━━━━━━━

Approved by ADMIN:
${admin.name}`
        );

        // ==========================
        // MEMBER NOTIFICATION
        // ==========================

        try {

            await ctx.telegram.sendMessage(
                targetTelegramId,
`🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

🎉 REGISTRATION APPROVED

👤 Member : ${member.name}

📊 Status : 🟢 ACTIVE

━━━━━━━━━━━━━━━━━━

✅ Your HSK BRAHMASTRA membership
has been approved.

Next step:
🔐 Connect your Dhan account.

Please wait for the Dhan connection option.`
            );

        } catch (notifyError) {

            console.error(
                "⚠️ MEMBER NOTIFICATION FAILED:",
                notifyError.message
            );

        }

        console.log(
            "✅ MEMBER APPROVED:",
            targetTelegramId,
            "BY ADMIN:",
            adminTelegramId
        );

    } catch (err) {

        console.error(
            "❌ MEMBER APPROVE ERROR:",
            err
        );

        await ctx.reply(
            `❌ APPROVAL FAILED\n\n${err.message}`
        );

    }

});

// ==========================
// MARKET-WISE LOTS
// ==========================

const marketLotCommands = {
    n: "NIFTY",
    bn: "BANKNIFTY",
    s: "SENSEX",
    c: "CRUDEOIL",
    cm: "CRUDEOIL_MINI",
    ng: "NATURALGAS",
    ngm: "NATURALGAS_MINI"
};

for (const [command, market] of Object.entries(marketLotCommands)) {

    bot.command(command, async (ctx) => {

        try {

            const args =
                ctx.message.text.trim().split(/\s+/);

            // /n → show current NIFTY lots
            if (args.length === 1) {

                const marketLots =
                    await systemService.getMarketLots();

                const lots =
                    Number(marketLots[market] || 1);

                await ctx.reply(
`🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

📊 ${market}

📦 Current Lots : ${lots}

━━━━━━━━━━━━━━━━━━

Command:
 /${command} 1
 /${command} 2
 /${command} 3
 ...
 /${command} 30

━━━━━━━━━━━━━━━━━━`
                );

                return;
            }

            const lots = Number(args[1]);

            if (
                !Number.isInteger(lots) ||
                lots < 1 ||
                lots > 50
            ) {

                await ctx.reply(
`❌ INVALID LOTS

📊 Market : ${market}

Allowed : 1 to 30

Example:
/${command} 2`
                );

                return;
            }

            await systemService.setMarketLots(
                market,
                lots
            );

            await ctx.reply(
`✅ LOTS UPDATED

━━━━━━━━━━━━━━━━━━

📊 Market : ${market}
📦 Lots   : ${lots}

━━━━━━━━━━━━━━━━━━

🎯 Next Dhan Order
📊 Quantity = Exchange Lot × ${lots}

━━━━━━━━━━━━━━━━━━

Database Updated Successfully`
            );

            console.log(
                `✅ ${market} Lots Set: ${lots}`
            );

        } catch (err) {

            console.error(
                `❌ ${market} LOTS ERROR:`,
                err
            );

            await ctx.reply(
                `❌ LOTS UPDATE FAILED\n\n${err.message}`
            );
        }

    });

}

// ==========================
// 3 WAIT CONTROL
// LIMIT SUPER ORDER ONLY
// ==========================

bot.hears(/^\/w3(?:\s+(on|off))?$/i, async (ctx) => {

    try {

        const args = ctx.message.text
            .trim()
            .toLowerCase()
            .split(/\s+/);

        // ==========================
        // W3 STATUS
        // ==========================

        if (args.length === 1) {

            const status =
                await systemService.getW3Wait();

            await ctx.reply(
`⏱️ HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━
📌 W3 WAIT STATUS

Status : ${status ? "🟢 ON" : "🔴 OFF"}

━━━━━━━━━━━━━━━━━━
🟢 w3 on
🔴 w3 off
━━━━━━━━━━━━━━━━━━

📌 LIMIT SUPER ORDER ONLY`
            );

            return;
        }


        // ==========================
        // 3 ON
        // ==========================

        if (args[1] === "on") {

            await systemService.setW3Wait(true);

            await ctx.reply(
`🟢 3 WAIT ENABLED

━━━━━━━━━━━━━━━━━━
⏱️ 3 Minute Pending Check : ON
🚫 Pending LIMIT Order → CANCEL
━━━━━━━━━━━━━━━━━━

📌 LIMIT SUPER ORDER ONLY`
            );

            console.log(
                "🟢 W3 WAIT : ON"
            );

            return;
        }


        // ==========================
        // W3 OFF
        // ==========================

        if (args[1] === "off") {

            await systemService.setW3Wait(false);

            await ctx.reply(
`🔴 W3 WAIT DISABLED 

━━━━━━━━━━━━━━━━━━
⏱️ 3 Minute Pending Check : OFF
✅ Pending LIMIT Order will NOT be cancelled by W3
━━━━━━━━━━━━━━━━━━

📌 LIMIT SUPER ORDER ONLY`
            );

            console.log(
                "🔴 W3 WAIT : OFF"
            );

            return;
        }

    } catch (err) {

        console.error(
            "❌ W3 COMMAND ERROR:",
            err
        );

        await ctx.reply(
            `❌ W3 UPDATE FAILED\n\n${err.message}`
        );
    }

});
// ==========================
// ORDER MODE
// ==========================

bot.command("ordermode", async (ctx) => {

    try {

        const currentMode = await systemService.getOrderMode();

        await ctx.reply(
            `🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

📌 ORDER MODE

Current Mode : ${currentMode}

Select Order Type:

━━━━━━━━━━━━━━━━━━`,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "🟢 LIMIT",
                        "ORDER_MODE_LIMIT"
                    ),
                    Markup.button.callback(
                        "🔵 MARKET",
                        "ORDER_MODE_MARKET"
                    )
                ]
            ])
        );

    } catch (err) {

        console.error(err);

        await ctx.reply(
            `❌ ORDER MODE FAILED\n\n${err.message}`
        );

    }

});

// ==========================
// ORDER MODE BUTTON HANDLER
// ==========================

bot.action("ORDER_MODE_LIMIT", async (ctx) => {

    try {

        const mode =
            await setOrderMode("LIMIT");

        await ctx.answerCbQuery(
            "LIMIT MODE SELECTED"
        );

        await ctx.editMessageText(
            `🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

📌 ORDER MODE

Current Mode : 🟢 ${mode}

━━━━━━━━━━━━━━━━━━

⏱️ LIMIT ORDER
3 Minute Pending Check
→ PENDING = CANCEL

━━━━━━━━━━━━━━━━━━

✅ LIMIT MODE ACTIVE`
        );

        console.log(
            "🟢 Telegram Order Mode : LIMIT"
        );

    } catch (err) {

        console.error(err);

        await ctx.answerCbQuery(
            "❌ Failed"
        );

    }

});


bot.action("ORDER_MODE_MARKET", async (ctx) => {

    try {

        const mode =
            await setOrderMode("MARKET");

        await ctx.answerCbQuery(
            "MARKET MODE SELECTED"
        );

        await ctx.editMessageText(
            `🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

📌 ORDER MODE

Current Mode : 🔵 ${mode}

━━━━━━━━━━━━━━━━━━

⚡ MARKET ORDER
No 3 Minute Pending Cancel

━━━━━━━━━━━━━━━━━━

✅ MARKET MODE ACTIVE`
        );

        console.log(
            "🔵 Telegram Order Mode : MARKET"
        );

    } catch (err) {

        console.error(err);

        await ctx.answerCbQuery(
            "❌ Failed"
        );

    }

});

// ==========================
// STATUS
// ==========================

bot.command("status", async (ctx) => {

    try {

        const settings =
            await systemService.getSettings();

        const currentIST = new Intl.DateTimeFormat(
                "en-IN",
            {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "medium"
            }
        ).format(new Date());

        const status =
            settings.auto_trading ? "🟢 ON" : "🔴 OFF";
        const mode =
            settings.paper_mode
                ? "📝 PAPER"
                : "🔴 LIVE";
        await ctx.reply(
`🤖 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

🤖 Broker : DHAN

Auto Trading : ${status}
Mode         : ${mode}

Updated :
${currentIST}

━━━━━━━━━━━━━━━━━━`
        );

    } catch (err) {

        console.error(err);

        await ctx.reply(`❌ ${err.message}`);

    }

});

// ==========================
// RESET
// ==========================

bot.command("reset", async (ctx) => {

    try {

        const success = await tradeService.resetTrades();

        if (!success) {
        throw new Error("Trade Reset Failed");
    }

        await ctx.reply(
`🧹 HSK BRAHMASTRA

━━━━━━━━━━━━━━━━━━

✅ Manual Reset Completed

📦 Active Trades : 0
📁 Closed Trades : 0
📊 Dashboard Reset

🚀 Ready For New Session`
        );

        console.log("✅ Manual Reset Completed");

    } catch (err) {

        console.error(err);

        await ctx.reply(
`❌ RESET FAILED

${err.message}`
        );

    }

});

// ==========================
// SHOW ALL MARKET LOTS
// ==========================

bot.command("lots", async (ctx) => {

    try {

        const marketLots =
            await systemService.getMarketLots();

        await ctx.reply(
`📦 HSK BRAHMASTRA — CURRENT LOTS

━━━━━━━━━━━━━━━━━━

📊 NIFTY       : ${marketLots.NIFTY || 1}
📊 BANKNIFTY   : ${marketLots.BANKNIFTY || 1}
📊 SENSEX      : ${marketLots.SENSEX || 1}

🛢️ CRUDEOIL    : ${marketLots.CRUDEOIL || 1}
🛢️ CRUDE MINI  : ${marketLots.CRUDEOIL_MINI || 1}

🔥 NATURAL GAS : ${marketLots.NATURALGAS || 1}
🔥 NG MINI     : ${marketLots.NATGASMINI || 1}

━━━━━━━━━━━━━━━━━━

🟢 LOT SETTINGS ACTIVE`
        );

    } catch (err) {

        console.error(
            "❌ SHOW LOTS ERROR:",
            err
        );

        await ctx.reply(
            `❌ LOTS CHECK FAILED\n\n${err.message}`
        );
    }

});
// ==========================
// MANUAL NORMAL LIMIT ORDER
// ==========================

bot.command("order", async (ctx) => {

    try {

        const args =
            ctx.message.text.trim().split(/\s+/);

        // =====================================
        // USAGE
        // /order NIFTY 23300 CE 1 120
        // =====================================

        if (args.length !== 6) {

            await ctx.reply(
`❌ INVALID ORDER FORMAT

Use:

/order NIFTY 23300 CE 1 120

Example:

📊 Symbol     : NIFTY
🎯 Strike     : 23300
📈 Option     : CE
📦 Lots       : 1
💰 Limit Price: 120`
            );

            return;
        }


        // =====================================
        // READ ORDER
        // =====================================

        const symbol =
            String(args[1])
                .trim()
                .toUpperCase();

        const strike =
            Number(args[2]);

        const optionType =
            String(args[3])
                .trim()
                .toUpperCase();

        const lots =
            Number(args[4]);

        const price =
            Number(args[5]);


        // =====================================
        // VALIDATION
        // =====================================

        if (
            !["NIFTY", "BANKNIFTY", "SENSEX",
              "CRUDEOIL", "CRUDEOIL_MINI",
              "NATURALGAS", "NATURALGAS_MINI"]
                .includes(symbol)
        ) {

            throw new Error(
                "Invalid symbol"
            );

        }


        if (
            !Number.isFinite(strike) ||
            strike <= 0
        ) {

            throw new Error(
                "Invalid strike"
            );

        }


        if (
            !["CE", "PE"].includes(optionType)
        ) {

            throw new Error(
                "Option must be CE or PE"
            );

        }


        if (
            !Number.isInteger(lots) ||
            lots <= 0
        ) {

            throw new Error(
                "Lots must be a positive whole number"
            );

        }


        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {

            throw new Error(
                "Invalid LIMIT price"
            );

        }


        // =====================================
        // SHOW CONFIRMATION
        // =====================================
await ctx.reply(
`📝 MANUAL NORMAL LIMIT ORDER

━━━━━━━━━━━━━━━━━━

📊 Symbol : ${symbol}
🎯 Strike : ${strike}
📈 Option : ${optionType}
📦 Lots   : ${lots}
💰 Price  : ₹${price}

━━━━━━━━━━━━━━━━━━
🟢 NORMAL LIMIT ORDER
🚀 Sending to Dhan...`
);
// =====================================
// SEND TO NORMAL SERVER
// =====================================

const NORMAL_ORDER_URL =
    process.env.NORMAL_ORDER_URL ||
    "http://localhost:3002";


console.log(
    "================================"
);

console.log(
    "📡 NORMAL ORDER SERVER"
);

console.log(
    "URL :",
    NORMAL_ORDER_URL
);

console.log(
    "================================"
);


const response =
    await fetch(
        `${NORMAL_ORDER_URL}/manual-order`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({

                    symbol,

                    strike,

                    optionType,

                    lots,

                    price,

                    expiry: null,
                    dryRun: false

                })

        }
    );


const result =
    await response.json();

        // =====================================
        // SERVER ERROR
        // =====================================

        if (!response.ok ||
            !result.success) {

            throw new Error(
                result.error ||
                "Normal order server failed"
            );

        }


        // =====================================
        // SUCCESS
        // =====================================

        const instrument =
            result.instrument || {};


        await ctx.reply(
`✅ NORMAL ORDER SUCCESS

━━━━━━━━━━━━━━━━━━

📊 ${symbol}
🎯 ${strike} ${optionType}

📦 Lots     : ${lots}
📦 Quantity : ${result.quantity}

💰 Limit    : ₹${result.price}

━━━━━━━━━━━━━━━━━━

🔹 Trading Symbol
${instrument.tradingSymbol || "-"}

🔹 Security ID
${instrument.securityId || "-"}

🔹 Exchange
${instrument.exchange || "-"}

━━━━━━━━━━━━━━━━━━

🟢 LIVE ORDER : ON
✅ DHAN ORDER : PLACED
🆔 Order ID : ${result.orderId || "-"}`
);

        console.log(
            "✅ Telegram Manual Order Dry Run:",
            {
                symbol,
                strike,
                optionType,
                lots,
                price
            }
        );


    } catch (err) {

        console.error(
            "❌ MANUAL ORDER ERROR:",
            err
        );

        await ctx.reply(
`❌ MANUAL ORDER FAILED

    ${err.message}`
        );

    }

});

// ==========================
// MANUAL MARKET ORDER
// ==========================

bot.command("mo", async (ctx) => {

    try {

        const args =
            ctx.message.text.trim().split(/\s+/);

        // =====================================
        // USAGE
        // /mo NIFTY 24800 CE 1
        // =====================================

        if (args.length !== 5) {

            await ctx.reply(
`❌ INVALID MARKET ORDER FORMAT

Use:

/mo NIFTY 24800 CE 1

Example:

📊 Symbol     : NIFTY
🎯 Strike     : 24800
📈 Option     : CE
📦 Lots       : 1

⚡ MARKET PRICE
💰 No price required`
            );

            return;
        }

        // =====================================
        // READ ORDER
        // =====================================

        const symbol =
            String(args[1])
                .trim()
                .toUpperCase();

        const strike =
            Number(args[2]);

        const optionType =
            String(args[3])
                .trim()
                .toUpperCase();

        const lots =
            Number(args[4]);

        // =====================================
        // VALIDATION
        // =====================================

        if (
            ![
                "NIFTY",
                "BANKNIFTY",
                "SENSEX",
                "CRUDEOIL",
                "CRUDEOIL_MINI",
                "NATURALGAS",
                "NATURALGAS_MINI"
            ].includes(symbol)
        ) {

            throw new Error(
                "Invalid symbol"
            );

        }

        if (
            !Number.isFinite(strike) ||
            strike <= 0
        ) {

            throw new Error(
                "Invalid strike"
            );

        }

        if (
            !["CE", "PE"].includes(optionType)
        ) {

            throw new Error(
                "Option must be CE or PE"
            );

        }

        if (
            !Number.isInteger(lots) ||
            lots <= 0
        ) {

            throw new Error(
                "Lots must be a positive whole number"
            );

        }

        // =====================================
        // CONFIRMATION
        // =====================================

        await ctx.reply(
`⚡ MANUAL MARKET ORDER

━━━━━━━━━━━━━━━━━━

📊 Symbol : ${symbol}
🎯 Strike : ${strike}
📈 Option : ${optionType}
📦 Lots   : ${lots}

━━━━━━━━━━━━━━━━━━

🔵 MARKET BUY
🚀 Sending to Dhan...`
        );

        // =====================================
        // NORMAL ORDER SERVER
        // =====================================

        const NORMAL_ORDER_URL =
            process.env.NORMAL_ORDER_URL ||
            "http://localhost:3002";

        console.log(
            "================================"
        );

        console.log(
            "📡 MARKET ORDER SERVER"
        );

        console.log(
            "URL :",
            NORMAL_ORDER_URL
        );

        console.log(
            "================================"
        );

        // =====================================
        // SEND MARKET ORDER
        // =====================================

        const response =
            await fetch(
                `${NORMAL_ORDER_URL}/manual-market-order`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            symbol,

                            strike,

                            optionType,

                            lots,

                            expiry: null

                        })
                }
            );

        const result =
            await response.json();

        // =====================================
        // SERVER ERROR
        // =====================================

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Market order server failed"
            );

        }

        // =====================================
        // SUCCESS
        // =====================================

        const instrument =
            result.instrument || {};

        await ctx.reply(
`✅ MARKET ORDER SUCCESS

━━━━━━━━━━━━━━━━━━

📊 ${symbol}
🎯 ${strike} ${optionType}

📦 Lots     : ${lots}
📦 Quantity : ${result.quantity}

━━━━━━━━━━━━━━━━━━

🔹 Trading Symbol
${instrument.tradingSymbol || "-"}

🔹 Security ID
${instrument.securityId || "-"}

🔹 Exchange
${instrument.exchange || "-"}

━━━━━━━━━━━━━━━━━━

🔵 MARKET ORDER : ON
✅ DHAN ORDER : PLACED
🆔 Order ID : ${result.orderId || "-"}

📊 Status : ${result.orderStatus || "-"}`
        );

        console.log(
            "✅ Telegram Market Order:",
            {
                symbol,
                strike,
                optionType,
                lots
            }
        );

    } catch (err) {

        console.error(
            "❌ MARKET ORDER ERROR:",
            err
        );

        await ctx.reply(
`❌ MARKET ORDER FAILED

${err.message}`
        );

    }

});

// ==========================
// HELP
// ==========================

bot.command("help", async (ctx) => {

    try {

        const marketLots =
            await systemService.getMarketLots();

        await ctx.reply(
`🤖 HSK BRAHMASTRA BOT

━━━━━━━━━━━━━━━━━━

📌 TRADING CONTROL

🟢 /starttrade
🔴 /stoptrade
📝 /paper
🚨 /live
🧹 /reset
📊 /status
⚙️ /ordermode
📝 /order NIFTY 23300 CE 1 120
━━━━━━━━━━━━━━━━━━

📈 CE / PE LIMIT BUFFER

💰 /buffer
💰 /buffer 0
💰 /buffer 1
💰 /buffer 2

━━━━━━━━━━━━━━━━━━

📦 MARKET-WISE LOTS

/n  ${marketLots.NIFTY || 1}  → NIFTY
/bn ${marketLots.BANKNIFTY || 1}  → BANKNIFTY
/s  ${marketLots.SENSEX || 1}  → SENSEX
/c  ${marketLots.CRUDEOIL || 1}  → CRUDEOIL
/cm ${marketLots.CRUDEOIL_MINI || 1}  → CRUDE MINI
/ng ${marketLots.NATURALGAS || 1}  → NATURAL GAS
/ngm ${marketLots.NATURALGAS_MINI || 1}  → NG MINI

━━━━━━━━━━━━━━━━━━

📝 LOT COMMAND EXAMPLES

/n 2
/bn 3
/s 4
/c 2
/cm 1
/ng 2



━━━━━━━━━━━━━━━━━━

❓ /help

━━━━━━━━━━━━━━━━━━

HSK BRAHMASTRA`
        );

    } catch (err) {

        console.error(
            "❌ HELP ERROR:",
            err
        );

        await ctx.reply(
            `❌ HELP FAILED\n\n${err.message}`
        );
    }

});
// ==========================
// TELEGRAM GLOBAL ERROR HANDLER
// ==========================

bot.catch((err, ctx) => {

    console.error("================================");
    console.error("❌ TELEGRAM BOT ERROR");
    console.error("Update Type :", ctx.updateType);
    console.error("Error :", err);
    console.error("================================");

});

module.exports = bot;

