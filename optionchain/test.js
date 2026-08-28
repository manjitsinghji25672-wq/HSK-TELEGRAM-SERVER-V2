const { calculateMaxPain } = require("./maxPain");

const optionChain = [
    { strike: 24700, ceOI: 120000, peOI: 45000 },
    { strike: 24750, ceOI: 150000, peOI: 70000 },
    { strike: 24800, ceOI: 200000, peOI: 150000 },
    { strike: 24850, ceOI: 170000, peOI: 180000 },
    { strike: 24900, ceOI: 130000, peOI: 210000 }
];

const result = calculateMaxPain(optionChain);

console.log(result);