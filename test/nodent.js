/*

run tests created by https://github.com/MatAtBread/nodent

the tests are adapted in test/nodent

*/

var fs = require('fs');
var babel = require("babel");

global.sleep = function (ms, callback) {
    setTimeout(callback, ms);
};

describe('nodent tests', function () {
    var files = fs.readdirSync(__dirname + '/nodent');
    files.forEach(function (file) {
        var pending = /\.pending\.js$/.test(file);
        if (pending)
            it(file.replace(/\.pending\.js/, ''));
        else
            it(file.replace(/\.js$/, ''), function (done) {
                var es5, es6;
                try {
                    es6 = fs.readFileSync(__dirname + '/nodent/' + file, 'utf8');
                } catch (e) {
                    return done(e);
                }

                try {
                    es5 = babel.transform(es6, {
                        filename: file,
                        compact: false,
                        optional: ["es7.asyncFunctions"],
                        plugins: ["../src/babel-plugin-async2cbn:before"]
                    }).code;
                } catch (e) {
                    console.error('Error parsing EcmaScript7');
                    console.error(es6);
                    if (e.loc)
                        return done(new Error(e.message + ' (' + (parseInt(e.loc.line) + parseInt(es6.line) - 1) + ':' + (parseInt(e.loc.column) + parseInt(es6.column) - 1) + ')'));
                    if (e.stack)
                        console.log(e.stack);
                    return done(new Error('Error parsing EcmaScript7: ' + e));
                }

                try {
                    var def = new Function('require', 'module', 'exports, callback', es5);
                    var module = {
                        exports: {}
                    };
                    def(require, module, module.exports);
                    var fn = module.exports;
                    fn(function (err, res) {
                        if (err) return done(err);
                        if (!res) return done(new Error('fn result=' + res));
                        done();
                    });
                } catch (e) {
                    console.error('Error running');
                    console.error(es5);
                    if (e.stack)
                        console.log(e.stack);
                    return done(new Error('Error running: ' + e.message));
                }
            });
    })
})
