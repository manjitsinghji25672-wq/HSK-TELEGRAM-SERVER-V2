function buildEntryMessage(data) {

    return `
${data.cmd === "CE_ENTRY" ? "🟢" : "🔴"} <b>${data.cmd.replace("_"," ")}</b>

📊 Symbol : ${data.symbol}
⏱ Timeframe : ${data.timeframe}
🎯 Strike : ${data.strike}
💰 Entry : ${data.price}
🛑 SL : ${data.sl}
🎯 TG1 : ${data.tg1}

🆔 Trade ID : ${data.tradeKey}

━━━━━━━━━━━━━━━━━━`;
}

function disclaimer() {

    return `

━━━━━━━━━━━━━━━━━━
⚠️ <b>Disclaimer</b>

• Educational Purpose Only
• Not SEBI Registered
• Trade At Your Own Risk`;

}

module.exports = {
    buildEntryMessage,
    disclaimer
};