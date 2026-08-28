const { getInstruments } = require("./instrumentLoader");

async function findInstrument(
    symbol,
    strike,
    optionType,
    requestedExpiry = null
) {

    // =====================================
    // SYMBOL MAP
    // =====================================

    const symbolMap = {
    NIFTY: "NIFTY",
    BANKNIFTY: "BANKNIFTY",
    SENSEX: "SENSEX",
    CRUDEOIL: "CRUDEOIL",
    CRUDEOILM: "CRUDEOILM",
    CRUDEOIL_MINI: "CRUDEOILM",
    NATURALGAS: "NATURALGAS",
    NATURALGAS_MINI: "NATGASMINT"

};

    const searchSymbol =
        symbolMap[symbol] || symbol;

    const rows = getInstruments();

    console.log("================================");
    console.log("🔎 FIND INSTRUMENT");
    console.log("Symbol        :", searchSymbol);
    console.log("Strike        :", strike);
    console.log("Option        :", optionType);
    console.log("Requested Exp :", requestedExpiry);
    console.log("📦 Loaded in Memory :", rows.length);
    console.log("================================");


    // =====================================
    // FIND MATCHING OPTIONS
    // =====================================

    const options = [];

    for (const row of rows) {

        if (
            row.SEM_TRADING_SYMBOL &&
            row.SEM_TRADING_SYMBOL.startsWith(
                searchSymbol + "-"
            ) &&
            Number(row.SEM_STRIKE_PRICE) ===
                Number(strike) &&
            row.SEM_OPTION_TYPE === optionType
        ) {

            // =====================================
            // CSV EXPIRY DATE
            // Example:
            // 2026-08-11 14:30:00
            // =====================================

            const rawExpiry =
                row.SEM_EXPIRY_DATE || "";

            const expiryDateOnly =
                rawExpiry.substring(0, 10);


            options.push({

                securityId:
                    row.SEM_SMST_SECURITY_ID,

                tradingSymbol:
                    row.SEM_TRADING_SYMBOL,

                strike:
                    Number(row.SEM_STRIKE_PRICE),

                optionType:
                    row.SEM_OPTION_TYPE,

                expiry:
                    new Date(rawExpiry),

                expiryDate:
                    expiryDateOnly,

                expiryFlag:
                    row.SEM_EXPIRY_FLAG,

                lotSize:
                    Number(row.SEM_LOT_UNITS),

                exchange:
                    row.SEM_TRADING_SYMBOL.startsWith(
                        "CRUDEOILM-"
                    ) ||
                    row.SEM_TRADING_SYMBOL.startsWith(
                        "CRUDEOIL-"
                    ) ||
                    row.SEM_TRADING_SYMBOL.startsWith(
                        "NATURALGAS-"
                    ) ||
                    row.SEM_TRADING_SYMBOL.startsWith(
                        "NATGASMINT-"
                    )

                        ? "MCX_COMM"

                        : row.SEM_TRADING_SYMBOL.startsWith(
                            "SENSEX-"
                        )
                            ? "BSE_FNO"

                            : "NSE_FNO"
            });
        }
    }


    // =====================================
    // NO INSTRUMENT
    // =====================================

    if (options.length === 0) {

        console.log("================================");
        console.log("❌ INSTRUMENT NOT FOUND");
        console.log("Symbol :", searchSymbol);
        console.log("Strike :", strike);
        console.log("Option :", optionType);
        console.log("Expiry :", requestedExpiry);
        console.log("================================");

        return null;
    }


    // =====================================
    // EXPIRY REQUESTED
    // =====================================

    if (requestedExpiry) {

        const expiryMatch =
            options.filter(
                x =>
                    x.expiryDate ===
                    requestedExpiry
            );


        // =====================================
        // EXACT EXPIRY FOUND
        // =====================================

        if (expiryMatch.length > 0) {

            // In case multiple rows exist
            expiryMatch.sort(
                (a, b) =>
                    a.expiry - b.expiry
            );

            const selected =
                expiryMatch[0];


            console.log("================================");
            console.log("✅ USING EXACT EXPIRY CONTRACT");
            console.log("================================");

            console.log(
                "Requested Expiry :",
                requestedExpiry
            );

            console.log(
                "Selected Expiry  :",
                selected.expiryDate
            );

            console.log(
                "Security ID      :",
                selected.securityId
            );

            console.log(
                "Trading Symbol   :",
                selected.tradingSymbol
            );

            console.log(
                "Strike           :",
                selected.strike
            );

            console.log(
                "Option           :",
                selected.optionType
            );

            console.log(
                "Lot Size         :",
                selected.lotSize
            );

            console.log(
                "Exchange         :",
                selected.exchange
            );

            console.log("================================");


            console.log("================================");
            console.log("RAW CSV ROW");
            console.log(
                rows.find(
                    r =>
                        r.SEM_SMST_SECURITY_ID ==
                        selected.securityId
                )
            );
            console.log("================================");


            return selected;
        }


        // =====================================
        // REQUESTED EXPIRY NOT FOUND
        // =====================================

        console.log("================================");
        console.log("❌ REQUESTED EXPIRY NOT FOUND");
        console.log("================================");

        console.log(
            "Requested Expiry :",
            requestedExpiry
        );

        console.log(
            "Symbol           :",
            searchSymbol
        );

        console.log(
            "Strike           :",
            strike
        );

        console.log(
            "Option           :",
            optionType
        );

        console.log("================================");

        console.log(
            "Available Expiries:"
        );

        const availableExpiries =
            [...new Set(
                options.map(
                    x => x.expiryDate
                )
            )];

        availableExpiries.forEach(
            expiry => {
                console.log(
                    "➡️",
                    expiry
                );
            }
        );

        console.log("================================");

        // IMPORTANT:
        // Do NOT silently select another expiry.
        return null;
    }


    // =====================================
    // NO EXPIRY PROVIDED
    // =====================================
    // Keep old behaviour as fallback
    // for older webhook requests.
    // =====================================

    const now = new Date();

    const valid =
        options.filter(
            x => x.expiry >= now
        );


    if (valid.length > 0) {

        valid.sort(
            (a, b) =>
                a.expiry - b.expiry
        );


        const selected =
            valid[0];


        console.log("================================");
        console.log("⚠️ NO EXPIRY PROVIDED");
        console.log("USING NEAREST VALID CONTRACT");
        console.log("================================");

        console.log(selected);

        console.log("================================");
        console.log("RAW CSV ROW");
        console.log(
            rows.find(
                r =>
                    r.SEM_SMST_SECURITY_ID ==
                    selected.securityId
            )
        );
        console.log("================================");


        return selected;
    }


    // =====================================
    // OLD FALLBACK
    // =====================================

    options.sort(
        (a, b) =>
            a.expiry - b.expiry
    );


    console.log("================================");
    console.log("⚠️ USING FALLBACK");
    console.log("================================");

    console.log(options[0]);

    console.log("================================");

    return options[0];
}


module.exports = {
    findInstrument
};