const dhan = require("./dhanApi");

async function getSuperOrderStatus(orderId) {

    try {

        console.log("================================");
        console.log("🔎 CHECK SUPER ORDER STATUS");
        console.log("Order ID :", orderId);
        console.log("================================");

        const response = await dhan.get("/super/orders");

        const orders = Array.isArray(response.data)
            ? response.data
            : [];

        const order = orders.find(
            item => String(item.orderId) === String(orderId)
        );

        if (!order) {

            console.log("⚠️ SUPER ORDER NOT FOUND");

            return null;
        }

        console.log("📊 SUPER ORDER STATUS :", order.orderStatus);

        return order;

    } catch (err) {

        console.log("================================");
        console.log("❌ SUPER ORDER STATUS CHECK FAILED");
        console.log("================================");

        if (err.response) {

            console.log("STATUS :", err.response.status);

            console.log(
                JSON.stringify(
                    err.response.data,
                    null,
                    2
                )
            );

        } else {

            console.log("ERROR :", err.message);

        }

        console.log("================================");

        throw err;
    }
}

module.exports = getSuperOrderStatus;