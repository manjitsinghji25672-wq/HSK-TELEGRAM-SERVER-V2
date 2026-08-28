const https = require("https");

// ==============================================
// FETCH NSE OPTION CHAIN
// ==============================================
async function fetchOptionChain() {

    return new Promise((resolve, reject) => {

        const options = {
            hostname: "www.nseindia.com",
            path: "/api/option-chain-indices?symbol=NIFTY",
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9"
            }
        };

        https.get(options, (res) => {

            let data = "";

            res.on("data", chunk => data += chunk);

            res.on("end", () => {

                try {

                    const json = JSON.parse(data);

                    resolve(json);

                } catch (err) {

                    reject(err);

                }

            });

        }).on("error", reject);

    });

}

module.exports = {
    fetchOptionChain
};