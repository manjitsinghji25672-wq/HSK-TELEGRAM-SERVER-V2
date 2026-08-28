const dhan = require("./dhanApi");

async function getOrders() {

    try {

        const response = await dhan.get("/orders");

        console.log(response.data);

    } catch (err) {

        console.log(err.response?.data || err.message);

    }

}

getOrders();