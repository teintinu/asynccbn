var double = require('./sample').double;

function sample001_asyncfn(callback) {
    double(5, function ($err, $res) {
        callback($err, $res);
    });
}
