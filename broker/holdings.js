const dhan = require("./dhanApi");

async function getHoldings() {

    try {

        const response = await dhan.get("/holdings");

        console.log("✅ HOLDINGS");
        console.log(response.data);

    } catch (err) {

        console.log("❌ ERROR");

        if (err.response) {
            console.log(err.response.data);
        } else {
            console.log(err.message);
        }

    }

}

getHoldings();
