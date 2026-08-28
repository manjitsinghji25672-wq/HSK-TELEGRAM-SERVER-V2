const MARKET_LOTS = {

    NIFTY: 65,

    BANKNIFTY: 30,

    SENSEX: 20,

    CRUDEOIL: 100,

    CRUDEOILM: 10,

    NATURALGAS: 1250

};

function getLotSize(market) {

    return MARKET_LOTS[market] || 1;

}

module.exports = {
    getLotSize
};