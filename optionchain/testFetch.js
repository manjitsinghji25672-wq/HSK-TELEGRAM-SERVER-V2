const { fetchOptionChain } = require("./optionData");

(async () => {
    try {

        const data = await fetchOptionChain();

        console.log("SUCCESS");
        console.log(Object.keys(data));

    } catch (err) {

        console.error(err);

    }
})();