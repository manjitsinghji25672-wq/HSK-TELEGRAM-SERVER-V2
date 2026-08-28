const dhan = require("./dhanApi");

async function cancelSuperOrder(orderId) {

    try {

        console.log("================================");
        console.log("❌ CANCELLING SUPER ORDER");
        console.log("Order ID :", orderId);
        console.log("================================");

        const response = await dhan.delete(
            `/super/orders/${orderId}/ENTRY_LEG`
        );

        console.log("================================");
        console.log("✅ SUPER ORDER CANCELLED");
        console.log("STATUS :", response.status);
        console.log(JSON.stringify(response.data, null, 2));
        console.log("================================");

        return response.data;

    } catch (err) {

        console.log("================================");
        console.log("❌ SUPER ORDER CANCEL FAILED");
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

module.exports = cancelSuperOrder;