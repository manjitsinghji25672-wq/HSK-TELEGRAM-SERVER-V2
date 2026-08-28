const dhan = require("./dhanApi");
const buildSuperOrder = require("./buildSuperOrder");
const tradeService = require("../services/tradeService");
const cancelSuperOrder = require("./cancelSuperOrder");
const getSuperOrderStatus = require("./getSuperOrderStatus");
const systemService = require("../services/systemService");
// =====================================
// LIVE SUPER ORDER STATUS MONITOR
// =====================================

async function monitorSuperOrder(orderId, orderType) {

    // =====================================
    // ONLY LIMIT ORDERS
    // =====================================

    if (orderType !== "LIMIT") {

        console.log("================================");
        console.log("ℹ️ LIVE STATUS CHECK SKIPPED");
        console.log("Order ID   :", orderId);
        console.log("Order Type :", orderType);
        console.log("================================");

        return;
    }

    // Check every 10 seconds
    const intervalMs = 10 * 1000;

    // Maximum monitoring time = 6 minutes
    const maxTimeMs = 6 * 60 * 1000;

    const startTime = Date.now();

    console.log("================================");
    console.log("📡 LIVE SUPER ORDER MONITOR");
    console.log("================================");
    console.log("Order ID   :", orderId);
    console.log("Order Type :", orderType);
    console.log("Interval   : 10 seconds");
    console.log("Max Time   : 6 minutes");
    console.log("================================");


    // =====================================
    // LIVE POLLING LOOP
    // =====================================

    while (Date.now() - startTime < maxTimeMs) {

        // Wait 10 seconds
        await new Promise(resolve =>
            setTimeout(resolve, intervalMs)
        );


        try {

            // =====================================
            // GET LATEST DHAN STATUS
            // =====================================

            const latestOrder =
                await getSuperOrderStatus(orderId);


            if (!latestOrder) {

                console.log("================================");
                console.log("⚠️ SUPER ORDER STATUS NOT FOUND");
                console.log("Order ID :", orderId);
                console.log("================================");

                continue;
            }


            // =====================================
            // STATUS
            // =====================================

            const status =
                latestOrder.orderStatus;


            console.log("================================");
            console.log("📡 LIVE SUPER ORDER STATUS");
            console.log("================================");

            console.log(
                "Order ID :",
                orderId
            );

            console.log(
                "Status   :",
                status
            );


            // =====================================
            // TRADED PRICE
            // =====================================

            if (
                latestOrder.averageTradedPrice !== undefined
            ) {

                console.log(
                    "Avg Price :",
                    latestOrder.averageTradedPrice
                );
            }


            // =====================================
            // FILLED QUANTITY
            // =====================================

            if (
                latestOrder.filledQty !== undefined
            ) {

                console.log(
                    "Filled Qty :",
                    latestOrder.filledQty
                );
            }


            // =====================================
            // REMAINING QUANTITY
            // =====================================

            if (
                latestOrder.remainingQuantity !== undefined
            ) {

                console.log(
                    "Remaining Qty :",
                    latestOrder.remainingQuantity
                );
            }


            console.log("================================");


            // =====================================
            // TRADED
            // =====================================

            if (status === "TRADED") {

                console.log("================================");
                console.log("✅ ENTRY ORDER TRADED");
                console.log("================================");

                console.log(
                    "Order ID :",
                    orderId
                );

                console.log(
                    "Avg Price :",
                    latestOrder.averageTradedPrice
                );

                console.log(
                    "Filled Qty :",
                    latestOrder.filledQty
                );

                console.log("================================");

                return;
            }


            // =====================================
            // PART TRADED
            // =====================================

            if (status === "PART_TRADED") {

                console.log("================================");
                console.log("⚠️ ORDER PARTIALLY TRADED");
                console.log("================================");

                console.log(
                    "Filled Qty :",
                    latestOrder.filledQty
                );

                console.log(
                    "Remaining Qty :",
                    latestOrder.remainingQuantity
                );

                console.log("⏳ CONTINUING MONITORING");
                console.log("================================");

                continue;
            }


            // =====================================
            // REJECTED
            // =====================================

            if (status === "REJECTED") {

                console.log("================================");
                console.log("❌ ORDER REJECTED");
                console.log("================================");

                console.log(
                    "Order ID :",
                    orderId
                );

                return;
            }


            // =====================================
            // CANCELLED
            // =====================================

            if (status === "CANCELLED") {

                console.log("================================");
                console.log("❌ ORDER CANCELLED");
                console.log("================================");

                console.log(
                    "Order ID :",
                    orderId
                );

                return;
            }


            // =====================================
            // EXPIRED
            // =====================================

            if (status === "EXPIRED") {

                console.log("================================");
                console.log("❌ ORDER EXPIRED");
                console.log("================================");

                console.log(
                    "Order ID :",
                    orderId
                );

                return;
            }


            // =====================================
            // PENDING
            // =====================================

            if (status === "PENDING") {

                console.log("================================");
                console.log("⏳ ORDER PENDING");
                console.log("================================");

                console.log(
                    "Waiting for LIMIT entry..."
                );

                console.log("================================");

                continue;
            }


            // =====================================
            // TRANSIT
            // =====================================

            if (status === "TRANSIT") {

                console.log("================================");
                console.log("🚚 ORDER IN TRANSIT");
                console.log("================================");

                console.log(
                    "Waiting for exchange processing..."
                );

                console.log("================================");

                continue;
            }


            // =====================================
            // OTHER STATUS
            // =====================================

            console.log("================================");
            console.log("ℹ️ OTHER ORDER STATUS");
            console.log("Status :", status);
            console.log("================================");

        } catch (err) {

            console.log("================================");
            console.log("❌ LIVE STATUS CHECK FAILED");
            console.log("================================");


            if (err.response) {

                console.log(
                    "STATUS :",
                    err.response.status
                );

                console.log(
                    "DHAN RESPONSE :",
                    JSON.stringify(
                        err.response.data,
                        null,
                        2
                    )
                );

            } else {

                console.log(
                    "ERROR :",
                    err.message
                );
            }

            console.log("================================");
        }
    }


    // =====================================
    // 6 MINUTES COMPLETED
    // =====================================

    console.log("================================");
    console.log("⏱️ 6 MINUTES COMPLETED");
    console.log("================================");

    console.log(
        "Order ID :",
        orderId
    );


    try {

        // =====================================
        // FINAL STATUS CHECK
        // =====================================

        const finalOrder =
            await getSuperOrderStatus(orderId);


        if (!finalOrder) {

            console.log(
                "⚠️ FINAL STATUS NOT FOUND"
            );

            return;
        }


        const finalStatus =
            finalOrder.orderStatus;


        console.log("================================");
        console.log("📊 FINAL ORDER STATUS");
        console.log("================================");

        console.log(
            "Order ID :",
            orderId
        );

        console.log(
            "Status   :",
            finalStatus
        );

        console.log("================================");

// =====================================
// W3 WAIT CHECK
// LIMIT SUPER ORDER ONLY
// =====================================

const w3Enabled =
    await systemService.getW3Wait();

console.log("================================");
console.log("⏱️ W3 WAIT STATUS");
console.log("W3 :", w3Enabled ? "ON" : "OFF");
console.log("================================");


// =====================================
// CANCEL ONLY IF W3 ON + PENDING
// =====================================

if (finalStatus === "PENDING" && w3Enabled) {

    console.log("================================");
    console.log("❌ ORDER STILL PENDING");
    console.log("================================");

    console.log(
        "🚫 W3 ON → CANCELLING SUPER ORDER"
    );

    await cancelSuperOrder(orderId);

    console.log("================================");
    console.log(
        "✅ PENDING SUPER ORDER CANCELLED"
    );
    console.log("================================");

} else if (finalStatus === "PENDING" && !w3Enabled) {

    console.log("================================");
    console.log("⏸️ W3 WAIT IS OFF");
    console.log("================================");

    console.log(
        "✅ PENDING LIMIT ORDER WILL NOT BE CANCELLED"
    );

    console.log("================================");

} else {

    console.log("================================");
    console.log(
        "✅ ORDER IS NO LONGER PENDING"
    );
    console.log("================================");

    console.log(
        "Final Status :",
        finalStatus
    );

    console.log("================================");
}

    } catch (err) {

        console.log("================================");
        console.log("❌ FINAL STATUS CHECK FAILED");
        console.log("================================");


        if (err.response) {

            console.log(
                "STATUS :",
                err.response.status
            );

            console.log(
                "DHAN RESPONSE :",
                JSON.stringify(
                    err.response.data,
                    null,
                    2
                )
            );

        } else {

            console.log(
                "ERROR :",
                err.message
            );
        }

        console.log("================================");
    }
}


// =====================================
// PLACE SUPER ORDER
// =====================================

async function placeSuperOrder(orderData) {

    try {

        // =====================================
        // BUILD SUPER ORDER
        // =====================================

        const order =
            await buildSuperOrder(orderData);


        console.log("================================");
        console.log("🚀 PLACE SUPER ORDER");
        console.log("================================");


        // =====================================
        // FINAL PAYLOAD
        // =====================================

        console.log(
            "FINAL SUPER ORDER PAYLOAD"
        );

        console.log(
            JSON.stringify(
                order,
                null,
                2
            )
        );


        // =====================================
        // DHAN REQUEST
        // =====================================

        console.log("================================");
        console.log("🚀 DHAN SUPER ORDER REQUEST");
        console.log("================================");

        console.log(
            "URL :",
            dhan.defaults.baseURL +
            "/super/orders"
        );

        console.log(
            "METHOD : POST"
        );

        console.log("BODY :");

        console.log(
            JSON.stringify(
                order,
                null,
                2
            )
        );

        console.log("================================");


        // =====================================
        // PLACE ORDER
        // =====================================

        const response =
            await dhan.post(
                "/super/orders",
                order
            );


        // =====================================
        // DHAN RESPONSE
        // =====================================

        console.log("================================");
        console.log("✅ DHAN SUPER ORDER RESPONSE");
        console.log("================================");

        console.log(
            "STATUS :",
            response.status
        );

        console.log(
            JSON.stringify(
                response.data,
                null,
                2
            )
        );

        console.log("================================");


        // =====================================
        // ORDER ID
        // =====================================

        const orderId =
            response.data?.orderId ||
            response.data?.data?.orderId ||
            null;


        // =====================================
        // ORDER STATUS
        // =====================================

        const orderStatus =
            response.data?.orderStatus ||
            response.data?.data?.orderStatus ||
            null;


        // =====================================
        // VALIDATE ORDER ID
        // =====================================

        if (!orderId) {

            throw new Error(
                "Super Order ID not received from Dhan"
            );
        }


        // =====================================
        // ORDER PLACED
        // =====================================

        console.log("================================");
        console.log("✅ SUPER ORDER PLACED");
        console.log("================================");

        console.log(
            "Order ID :",
            orderId
        );

        console.log(
            "Status   :",
            orderStatus
        );

        console.log("================================");


        // =====================================
        // SAVE BROKER ORDER
        // =====================================

        await tradeService.saveBrokerOrder({

            tradeKey:
                orderData.tradeKey,

            orderId,

            securityId:
                order.securityId,

            exchangeSegment:
                order.exchangeSegment,

            quantity:
                order.quantity,

            productType:
                order.productType,

            status:
                orderStatus ||
                "OPEN"

        });


        console.log(
            "✅ Super Order Saved"
        );


        // =====================================
        // START LIVE MONITOR
        // =====================================

        if (order.orderType === "LIMIT") {

            console.log("================================");
            console.log(
                "📡 STARTING LIVE STATUS MONITOR"
            );
            console.log("================================");

            // =====================================
            // IMPORTANT:
            // Do NOT await this.
            // Webhook should return immediately.
            // =====================================

            monitorSuperOrder(
                orderId,
                order.orderType
            ).catch(err => {

                console.log("================================");
                console.log(
                    "❌ SUPER ORDER MONITOR ERROR"
                );

                console.log(
                    "ERROR :",
                    err.message
                );

                console.log("================================");

            });

        } else {

            console.log("================================");
            console.log(
                "ℹ️ LIVE MONITOR NOT STARTED"
            );

            console.log(
                "Order Type :",
                order.orderType
            );

            console.log("================================");
        }


        // =====================================
        // RETURN RESULT
        // =====================================

        return {

            orderId,

            orderStatus,

            brokerResponse:
                response.data

        };


    } catch (err) {

        console.log("================================");
        console.log("❌ DHAN SUPER ORDER FAILED");
        console.log("================================");


        if (err.response) {

            console.log(
                "STATUS :",
                err.response.status
            );


            console.log(
                "DHAN RESPONSE :"
            );


            console.log(
                JSON.stringify(
                    err.response.data,
                    null,
                    2
                )
            );


            console.log("================================");

        } else {

            console.log(
                "ERROR :",
                err.message
            );
        }


        throw err;
    }
}


// =====================================
// EXPORT
// =====================================

module.exports = placeSuperOrder;