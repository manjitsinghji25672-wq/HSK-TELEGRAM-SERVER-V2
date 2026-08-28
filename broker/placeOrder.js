const dhan = require("./dhanApi");
const buildOrder = require("./buildOrder");
const tradeService = require("../services/tradeService");

async function placeOrder(orderData) {

    try {

        // ==========================
        // Build Order
        // ==========================

        const order = await buildOrder(orderData);

        console.log("📤 Sending Order...");
        console.log(order);

        console.log("================================");
        console.log("FINAL ORDER PAYLOAD");
        console.log(JSON.stringify(order, null, 2));
        console.log("================================");

        // ==========================
        // Place Order
        // ==========================
        console.log("================================");
        console.log("REQUEST URL");
        console.log(dhan.defaults.baseURL + "/orders");

        console.log("REQUEST HEADERS");
        console.log(dhan.defaults.headers);

        console.log("REQUEST BODY");
        console.log(JSON.stringify(order, null, 2));
        console.log("================================");

        console.log("################################");
        console.log("FINAL ORDER PAYLOAD");
        console.log(JSON.stringify(order, null, 2));
        console.log("################################");

        const response = await dhan.post("/orders", order);

        console.log("✅ ORDER PLACED");
        console.log(response.data);

        // ==========================
        // Save Broker Order
        // ==========================

        const orderId =
            response.data.orderId ||
            response.data.data?.orderId ||
            null;

        if (!orderId) {
            throw new Error("Broker Order ID not received");
        }

        await tradeService.saveBrokerOrder({

            tradeKey: orderData.tradeKey,

            orderId,

            securityId: order.securityId,

            exchangeSegment: order.exchangeSegment,

            quantity: order.quantity,

            productType: order.productType,

            status: "OPEN"

        });

        return {

            orderId,

            brokerResponse: response.data

        };

    } catch (err) {

    console.log("❌ ORDER FAILED");

    if (err.response) {

        console.log("================================");
        console.log("STATUS :", err.response.status);

        console.log("HEADERS :");
        console.log(err.response.headers);

        console.log("DHAN RESPONSE :");
        console.log(JSON.stringify(err.response.data, null, 2));

        console.log("================================");

    } else {

        console.log(err.message);

    }

    throw err;

}

}

module.exports = placeOrder;