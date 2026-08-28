const config = require("./config");

async function buildSuperOrder({

    transactionType = "BUY",

    productType = "INTRADAY",

    orderType = "LIMIT",

    securityId,

    exchange,

    quantity,

    price,

    targetPrice,

    stopLossPrice,

    trailingJump = 0

}) {

    console.log("================================");
    console.log("BUILD SUPER ORDER");
    console.log("Security       :", securityId);
    console.log("Exchange       :", exchange);
    console.log("Quantity       :", quantity);
    console.log("Entry Price    :", price);
    console.log("Target Price   :", targetPrice);
    console.log("Stop Loss      :", stopLossPrice);
    console.log("Trailing Jump  :", trailingJump);
    console.log("================================");

    const order = {

        dhanClientId: config.CLIENT_ID,

        correlationId: "HSKSO_" + Date.now(),

        transactionType,

        exchangeSegment: exchange,

        productType,

        orderType,

        securityId: String(securityId),

        quantity: Number(quantity),

        price:
            orderType === "MARKET"
                ? 0
                : Number(price),

        targetPrice: Number(targetPrice),

        stopLossPrice: Number(stopLossPrice),

        trailingJump: Number(trailingJump)

    };

    console.log("================================");
    console.log("FINAL SUPER ORDER");
    console.log(JSON.stringify(order, null, 2));
    console.log("================================");

    return order;

}

module.exports = buildSuperOrder;