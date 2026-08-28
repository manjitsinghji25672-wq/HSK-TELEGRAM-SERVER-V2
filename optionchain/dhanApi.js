const axios = require("axios");
const { CLIENT_ID, ACCESS_TOKEN } = require("./config");

// ==============================================
// DHAN API CLIENT
// ==============================================

const api = axios.create({
    baseURL: "https://api.dhan.co/v2",
    headers: {
        "access-token": ACCESS_TOKEN,
        "client-id": CLIENT_ID,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

module.exports = api;