function divideWithTimeout(a, b, callback) {
    setTimeout(function () {
        if (b == 0)
            callback("Can't divide " + a + " by zero");
        callback(null, a / b);
    }, 0);
}

function divideWithoutTimeout(a, b, callback) {
    if (b == 0)
        callback("Can't divide " + a + " by zero");
    callback(null, a / b);
}

module.exports.divideWithTimeout = divideWithTimeout;
module.exports.divideWithoutTimeout = divideWithoutTimeout;
