// =====================================
// ORDER MODE
// =====================================

const systemService =
    require("../services/systemService");

// =====================================
// GET CURRENT ORDER MODE
// =====================================

async function getOrderMode() {

    return await systemService.getOrderMode();

}

// =====================================
// SET ORDER MODE
// =====================================

async function setOrderMode(mode) {

    return await systemService.setOrderMode(mode);

}

// =====================================
// EXPORT
// =====================================

module.exports = {

    getOrderMode,

    setOrderMode

};