const axios = require("axios");
const fs = require("fs");

async function downloadInstrumentFile() {

    try {

        console.log("📥 Downloading Dhan Instrument List...");

        const response = await axios.get(
            "https://images.dhan.co/api-data/api-scrip-master.csv",
            {
                responseType: "stream"
            }
        );

        const writer = fs.createWriteStream("./optionchain/instruments.csv");

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {

            writer.on("finish", () => {

                console.log("✅ Instrument File Updated");

                resolve(true);

            });

            writer.on("error", (err) => {

                reject(err);

            });

        });

    } catch (err) {

        console.log("❌ Instrument Download Failed:", err.message);

        throw err;

    }

}

module.exports = {
    downloadInstrumentFile
};