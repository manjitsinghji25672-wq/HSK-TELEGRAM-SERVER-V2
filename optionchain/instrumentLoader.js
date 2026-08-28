const fs = require("fs");
const https = require("https");
const csv = require("csv-parser");

// =====================================
// CONFIG
// =====================================

const INSTRUMENT_URL =
    "https://images.dhan.co/api-data/api-scrip-master.csv";

const INSTRUMENT_FILE =
    "./optionchain/instruments.csv";

const TEMP_FILE =
    "./optionchain/instruments.tmp.csv";

// =====================================
// MEMORY
// =====================================

let instruments = [];

let refreshTimer = null;

// =====================================
// DOWNLOAD DHAN INSTRUMENT MASTER
// =====================================

function downloadInstruments() {

    return new Promise((resolve, reject) => {

        console.log("================================");
        console.log("📥 DOWNLOADING DHAN INSTRUMENT MASTER");
        console.log("================================");

        const file =
            fs.createWriteStream(TEMP_FILE);

        function handleResponse(response) {

            // =================================
            // HANDLE REDIRECT
            // =================================

            if (
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {

                file.close();

                try {
                    fs.unlinkSync(TEMP_FILE);
                } catch (e) {}

                console.log(
                    "↪️ Dhan CSV Redirect :",
                    response.headers.location
                );

                https.get(
                    response.headers.location,
                    handleResponse
                ).on(
                    "error",
                    reject
                );

                return;
            }

            // =================================
            // HTTP ERROR
            // =================================

            if (response.statusCode !== 200) {

                file.close();

                try {
                    fs.unlinkSync(TEMP_FILE);
                } catch (e) {}

                reject(
                    new Error(
                        `Dhan CSV download failed: HTTP ${response.statusCode}`
                    )
                );

                return;
            }

            // =================================
            // DOWNLOAD
            // =================================

            response.pipe(file);

            file.on(
                "finish",
                () => {

                    file.close();

                    // =================================
                    // CHECK FILE SIZE
                    // =================================

                    try {

                        const stats =
                            fs.statSync(TEMP_FILE);

                        if (stats.size < 100000) {

                            throw new Error(
                                "Downloaded Dhan CSV looks too small"
                            );
                        }

                    } catch (err) {

                        try {
                            fs.unlinkSync(
                                TEMP_FILE
                            );
                        } catch (e) {}

                        reject(err);

                        return;
                    }

                    // =================================
                    // REPLACE OLD CSV
                    // =================================

                    try {

                        fs.copyFileSync(
                            TEMP_FILE,
                            INSTRUMENT_FILE
                        );

                        fs.unlinkSync(
                            TEMP_FILE
                        );

                        console.log(
                            "✅ DHAN CSV UPDATED"
                        );

                        console.log(
                            "📁 File :",
                            INSTRUMENT_FILE
                        );

                        console.log(
                            "================================"
                        );

                        resolve();

                    } catch (err) {

                        try {
                            fs.unlinkSync(
                                TEMP_FILE
                            );
                        } catch (e) {}

                        reject(err);
                    }
                }
            );
        }

        // =====================================
        // START HTTPS DOWNLOAD
        // =====================================

        https.get(
            INSTRUMENT_URL,
            handleResponse
        ).on(
            "error",
            err => {

                file.close();

                try {
                    fs.unlinkSync(
                        TEMP_FILE
                    );
                } catch (e) {}

                reject(err);
            }
        );

    });
}

// =====================================
// LOAD CSV INTO MEMORY
// =====================================

function parseInstruments() {

    return new Promise(
        (resolve, reject) => {

            instruments = [];

            fs.createReadStream(
                INSTRUMENT_FILE
            )
                .pipe(csv())

                .on(
                    "data",
                    row => {

                        instruments.push(row);

                    }
                )

                .on(
                    "end",
                    () => {

                        console.log(
                            `✅ Loaded ${instruments.length} instruments`
                        );

                        resolve();

                    }
                )

                .on(
                    "error",
                    reject
                );

        }
    );
}

// =====================================
// LOAD LATEST INSTRUMENTS
// =====================================

async function loadInstruments() {

    try {

        console.log("================================");
        console.log("🔄 INSTRUMENT MASTER REFRESH");
        console.log("================================");

        // =================================
        // DOWNLOAD LATEST DHAN CSV
        // =================================

        await downloadInstruments();

        // =================================
        // LOAD INTO MEMORY
        // =================================

        await parseInstruments();

        console.log(
            "✅ INSTRUMENT MASTER READY"
        );

        console.log(
            "================================"
        );

        // =================================
        // AUTO REFRESH EVERY 24 HOURS
        // =================================

        scheduleAutoRefresh();

    } catch (err) {

        console.log("================================");
        console.log(
            "❌ INSTRUMENT MASTER UPDATE FAILED"
        );

        console.log(
            "ERROR :",
            err.message
        );

        console.log("================================");

        // =================================
        // FALLBACK TO EXISTING CSV
        // =================================

        try {

            if (
                fs.existsSync(
                    INSTRUMENT_FILE
                )
            ) {

                console.log(
                    "⚠️ USING EXISTING INSTRUMENT CSV"
                );

                await parseInstruments();

                console.log(
                    "✅ EXISTING CSV LOADED"
                );

                console.log(
                    "================================"
                );

                // Retry after 1 hour
                scheduleRetry();

            } else {

                throw new Error(
                    "No instrument CSV available"
                );

            }

        } catch (fallbackError) {

            console.log(
                "❌ INSTRUMENT LOAD FAILED"
            );

            throw fallbackError;
        }
    }
}

// =====================================
// AUTO REFRESH EVERY 24 HOURS
// =====================================

function scheduleAutoRefresh() {

    if (refreshTimer) {

        clearTimeout(
            refreshTimer
        );
    }

    refreshTimer =
        setTimeout(
            async () => {

                console.log(
                    "================================"
                );

                console.log(
                    "⏰ 24 HOURS COMPLETED"
                );

                console.log(
                    "🔄 AUTO REFRESHING DHAN CSV"
                );

                console.log(
                    "================================"
                );

                try {

                    await downloadInstruments();

                    await parseInstruments();

                    console.log(
                        "✅ DAILY INSTRUMENT REFRESH SUCCESS"
                    );

                    scheduleAutoRefresh();

                } catch (err) {

                    console.log(
                        "❌ DAILY INSTRUMENT REFRESH FAILED"
                    );

                    console.log(
                        "ERROR :",
                        err.message
                    );

                    console.log(
                        "⚠️ KEEPING EXISTING INSTRUMENT DATA"
                    );

                    scheduleRetry();

                }

            },
            24 * 60 * 60 * 1000
        );
}

// =====================================
// RETRY AFTER 1 HOUR
// =====================================

function scheduleRetry() {

    if (refreshTimer) {

        clearTimeout(
            refreshTimer
        );
    }

    refreshTimer =
        setTimeout(
            async () => {

                console.log(
                    "================================"
                );

                console.log(
                    "🔁 RETRYING DHAN INSTRUMENT CSV"
                );

                console.log(
                    "================================"
                );

                try {

                    await downloadInstruments();

                    await parseInstruments();

                    console.log(
                        "✅ INSTRUMENT RETRY SUCCESS"
                    );

                    scheduleAutoRefresh();

                } catch (err) {

                    console.log(
                        "❌ RETRY FAILED :",
                        err.message
                    );

                    scheduleRetry();

                }

            },
            60 * 60 * 1000
        );
}

// =====================================
// GET INSTRUMENTS
// =====================================

function getInstruments() {

    return instruments;

}

// =====================================
// EXPORT
// =====================================

module.exports = {

    loadInstruments,

    getInstruments,

    downloadInstruments

};