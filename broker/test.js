const dhan = require("./dhanApi");

async function test() {

    try {

        const response = await dhan.get("/fundlimit");

        console.log("✅ CONNECTED");
        console.log(response.data);

    } catch (err) {

        console.log("❌ ERROR");

        if (err.response) {
            console.log(err.response.status);
            console.log(err.response.data);
        } else {
            console.log(err.message);
        }

    }

}

test();