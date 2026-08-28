const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// ==========================
// SEND TELEGRAM MESSAGE
// ==========================

async function sendMessage(message) {

    try {

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        await axios.post(url, {
            chat_id: CHANNEL_ID,
            text: message,
            parse_mode: "HTML"
        });

        console.log("✅ Telegram Message Sent");

    } catch (err) {

        console.error("❌ Telegram Error:");

        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }

    }

}

module.exports = {
    sendMessage
};