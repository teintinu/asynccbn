function divide(a, b, callback) {
    setTimeout(function () {
        if (b == 0)
            callback("Can't divide " + a + " by zero");
        callback(null, a / b);
    }, 0);
}

module.exports.divide = divide;
