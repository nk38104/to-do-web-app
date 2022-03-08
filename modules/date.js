
const today = new Date();


module.exports.getDay = () => {
    const options = { weekday: "long" };

    return today.toLocaleDateString("en-US", {options});
};


module.exports.getMonth = () => {
    const options = { month: "long" };
    
    return today.toLocaleDateString("en-US", options)
}


module.exports.getYear = () => {
    const options = { year: "numeric" };
    
    return today.toLocaleDateString("en-US", options)
}


module.exports.getDate = () => {
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    return today.toLocaleDateString("en-US", options)
};
