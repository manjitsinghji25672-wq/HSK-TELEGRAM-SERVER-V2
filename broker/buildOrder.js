const config = require("./config");

async function buildOrder({

    transactionType = "BUY",

    productType = "INTRADAY",

    orderType = "LIMIT",

    securityId,

    exchange,

    quantity,

    price

}) {

    console.log("================================");
    console.log("BUILD ORDER");
    console.log("Security :", securityId);
    console.log("Exchange :", exchange);
    console.log("Quantity :", quantity);
    console.log("Price    :", price);
    console.log("================================");

    console.log("================================");
    console.log("ORDER INPUT");
    console.log({
        transactionType,
        productType,
        orderType,
        securityId,
        exchange,
        quantity,
        price
    });
    console.log("================================");

    const order = {

        dhanClientId: config.CLIENT_ID,

        correlationId: "HSK_" + Date.now(),

        transactionType,

        exchangeSegment: exchange,

        productType,

        orderType,

        validity: "DAY",

        securityId: String(securityId),

        quantity: Number(quantity),

        price: Number(price)

    };

    console.log("================================");
    console.log("FINAL ORDER");
    console.log(JSON.stringify(order, null, 2));
    console.log("================================");

    return order;

}

module.exports = buildOrder;