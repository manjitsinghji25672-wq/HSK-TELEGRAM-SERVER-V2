// ==============================================
// HSK MAX PAIN ENGINE
// ==============================================

function calculateMaxPain(optionChain) {

    let maxPain = null;
    let minLoss = Number.MAX_SAFE_INTEGER;

    for (const expiry of optionChain) {

        let totalLoss = 0;

        for (const strike of optionChain) {

            const ceLoss =
                Math.max(expiry.strike - strike.strike, 0) * strike.ceOI;

            const peLoss =
                Math.max(strike.strike - expiry.strike, 0) * strike.peOI;

            totalLoss += ceLoss + peLoss;
        }

        if (totalLoss < minLoss) {
            minLoss = totalLoss;
            maxPain = expiry.strike;
        }
    }

    return {
        maxPain,
        minLoss
    };

}

module.exports = {
    calculateMaxPain
};