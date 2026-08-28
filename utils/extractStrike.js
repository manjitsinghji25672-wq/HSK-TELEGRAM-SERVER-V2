// ==========================
// EXTRACT STRIKE
// ==========================

function extractStrikeFromSymbol(symbol) {

    if (!symbol) return null;

    // Generic helper
    function getStrike(regex1, regex2) {

        let match = symbol.match(regex1);

        if (!match && regex2) {
            match = symbol.match(regex2);
        }

        return match ? Number(match[1]) : null;
    }

    // ==========================
    // CRUDEOILM
    // ==========================

    if (symbol.startsWith("CRUDEOILM")) {

        return getStrike(
            /^CRUDEOILM\d{6}(\d+)(CE|PE)$/,
            /^CRUDEOILM\d{6}[CP](\d+)$/
        );

    }

    // ==========================
    // CRUDEOIL
    // ==========================

    if (symbol.startsWith("CRUDEOIL")) {

        return getStrike(
            /^CRUDEOIL\d{6}(\d+)(CE|PE)$/,
            /^CRUDEOIL\d{6}[CP](\d+)$/
        );

    }

    // ==========================
    // NATURALGAS
    // ==========================

    if (symbol.startsWith("NATURALGAS")) {

        return getStrike(
            /^NATURALGAS\d{6}(\d+)(CE|PE)$/,
            /^NATURALGAS\d{6}[CP](\d+)$/
        );

    }

    // ==========================
    // NIFTY
    // ==========================

    if (symbol.startsWith("NIFTY")) {

        return getStrike(
            /^NIFTY\d{6}(\d+)(CE|PE)$/,
            /^NIFTY\d{6}[CP](\d+)$/
        );

    }

    // ==========================
    // BANKNIFTY
    // ==========================

    if (symbol.startsWith("BANKNIFTY")) {

        return getStrike(
            /^BANKNIFTY\d{6}(\d+)(CE|PE)$/,
            /^BANKNIFTY\d{6}[CP](\d+)$/
        );

    }

    // ==========================
    // SENSEX
    // ==========================

    if (symbol.startsWith("SENSEX")) {

        return getStrike(
            /^SENSEX\d{6}(\d+)(CE|PE)$/,
            /^SENSEX\d{6}[CP](\d+)$/
        );

    }

    return null;

}

// ==========================
// MARKET NAME
// ==========================

function extractMarket(symbol) {

    if (!symbol) return null;

    if (symbol.startsWith("BANKNIFTY")) return "BANKNIFTY";
    if (symbol.startsWith("NIFTY")) return "NIFTY";
    if (symbol.startsWith("SENSEX")) return "SENSEX";
    if (symbol.startsWith("CRUDEOILM")) return "CRUDEOIL_MINI";
    if (symbol.startsWith("CRUDEOIL")) return "CRUDEOIL";
    if (symbol.startsWith("NATURALGAS")) return "NATURALGAS";

    return symbol;

}

// ==========================
// OPTION TYPE
// ==========================

function extractOptionType(symbol) {

    if (!symbol) return null;

    // NSE / BSE
    if (symbol.endsWith("CE")) return "CE";
    if (symbol.endsWith("PE")) return "PE";

    // MCX
    const match = symbol.match(/[CP](\d+)$/);

    if (!match) return null;

    return match[0].startsWith("C") ? "CE" : "PE";

}

// ==========================
// EXPORTS
// ==========================

module.exports = {
    extractStrikeFromSymbol,
    extractMarket,
    extractOptionType
};