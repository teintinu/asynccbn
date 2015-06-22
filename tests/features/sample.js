/** double a number asynchronously (nodejs way)
 * @Param x: number
 * @Result double of x
 * @Throws error if x < 0
 */
function double(x, callback) {
    setTimeout(function () {
        if (x < 0)
            callback("X must be positive");
        callback(null, x * x);
    }, 0);
}

module.exports[double] = double;
