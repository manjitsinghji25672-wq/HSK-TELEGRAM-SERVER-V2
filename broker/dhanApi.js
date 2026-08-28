const axios = require("axios");
const config = require("./config");

const dhan = axios.create({

    baseURL: "https://api.dhan.co/v2",

    headers: {

        "access-token": config.ACCESS_TOKEN,

        "client-id": config.CLIENT_ID,

        "Content-Type": "application/json",

        "Accept": "application/json"

    },

    timeout: 30000

});

// ==========================
// REQUEST LOGGER
// ==========================

dhan.interceptors.request.use(config => {

    console.log("================================");
    console.log("🚀 DHAN REQUEST");
    console.log("URL :", config.baseURL + config.url);
    console.log("METHOD :", config.method);
    console.log("HEADERS :", config.headers);
    console.log("BODY :", JSON.stringify(config.data, null, 2));
    console.log("================================");

    return config;

});

// ==========================
// RESPONSE LOGGER
// ==========================

dhan.interceptors.response.use(

    response => {

        console.log("================================");
        console.log("✅ DHAN RESPONSE");
        console.log("STATUS :", response.status);
        console.log(JSON.stringify(response.data, null, 2));
        console.log("================================");

        return response;

    },

    error => {

        console.log("================================");
        console.log("❌ DHAN ERROR");

        if (error.response) {

            console.log("STATUS :", error.response.status);

            console.log("BODY :");
            console.log(JSON.stringify(error.response.data, null, 2));

        } else {

            console.log(error.message);

        }

        console.log("================================");

        return Promise.reject(error);

    }

);

module.exports = dhan;