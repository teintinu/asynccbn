/*

run tests created by https://github.com/MatAtBread/nodent

the tests are adapted in test/nodent

*/


"use strict";

var Benchmark = require('benchmark');
var fs = require('fs'),
    path = require('path');
var argv = require('argv');
var asap = require('asap');
var Promise_Q = require('q');
var Promise_bluebird = require('bluebird');
var babel = require("babel");
require('microtime');
require('colors');

var transpilers = ['asynccbn', 'regenerator-Bluebird', 'regenerator-Q'];

argv.option({
    name: 'verbose',
    short: 'v',
    type: 'boolean',
    description: 'verbose mode'
})
argv.type('transpiler', function (value) {
    if (transpilers.indexOf(value) == -1)
        throw "Use --only=transpiler. Valid transpilers: " + transpilers.join(',');
    return value;
});
argv.option({
    name: 'only',
    short: 'o',
    type: 'transpiler',
    description: 'Benchmark only these transpiler',
    example: "Valid transpilers: " + transpilers.join(',')
});
var options = argv.run().options;
if (options.only)
    transpilers = [options.only];

console.log('Benchmark runnung nodent tests');

var test_path = path.resolve(__dirname + '/../test/nodent');
var files = fs.readdirSync(test_path);

function runfile(idx) {
    var file = files[idx];

    var pending = /\.pending\.js$/.test(file);
    if (!pending) {
        var es7;

        verbose(test_path + '/' + file);
        es7 = fs.readFileSync(test_path + '/' + file, 'utf8');

        var result = transpile(file, es7);

        execute(file, result, function (err, res) {
            if (err)
                throw err;
            show_benchmark_result(result);
        });

    } else runfile(idx + 1);

    function show_benchmark_result(res) {
        transpilers.forEach(function (transpiler) {
            console.log(transpiler + ': ' + res[transpiler].bench_info.toString());
        });
    }
}

function execute(file, result, callback) {
    var suite = new Benchmark.Suite;

    transpilers.forEach(add_test);

    suite.on('cycle', function (event) {
        verbose(String(event.target));
    });

    suite.on('complete', function () {
        verbose('Benchmark complete');

        suite.forEach(function (s) {
            result[s.name].bench_info = s;
        });

        callback(null, result);
        result.winner = suite.filter('fastest');
    });

    verbose('Starting benchmark');
    suite.run({
        'async': true
    });

    function add_test(transpiler) {
        verbose('Adding transpiler ' + transpiler + ' to benchmark');
        suite.add(transpiler, {
            'defer': true,
            'fn': function execute(deferred) {
                result[transpiler].execute(
                    result[transpiler].fn, deferred);
            }
        });
    }
}

function transpile(file, es7_code) {

    var result = {};
    transpilers.forEach(transpile_code);
    return result;

    function transpile_code(transpiler) {
        verbose('transpiler with ' + transpiler);
        result[transpiler] = transpile_functions[transpiler](file, es7_code);
    }
}

var transpile_functions = {
    asynccbn: function transpile_asynccbn(file, es7_code) {
        var es5_code = babel.transform(es7_code, {
            filename: file,
            compact: true,
            optional: ["es7.asyncFunctions"],
            plugins: ["../src/babel-plugin-async2cbn:before"]
        }).code;

        var def = new Function('require', 'module',
            'exports', 'sleep',
            es5_code);
        var module = {
            exports: {}
        };
        def(require, module, module.exports, sleep_callback);

        return {
            fn: module.exports,
            execute: function (fn, deferred) {
                fn(function (err, res) {
                    if (err)
                        deferred.fail(err);
                    if (!res)
                        deferred.fail('res=' + res);
                    deferred.resolve();
                });
            }
        }
    },
    "regenerator-Bluebird": function (file, es7_code) {
        return asynccbn_regenerator(file, es7_code, Promise_Q);
    },
    "regenerator-Q": function (file, es7_code) {
        return asynccbn_regenerator(file, es7_code, Promise_Q);
    }
}

function asynccbn_regenerator(file, es7_code, promise_class) {
    var es5_code = babel.transform(es7_code, {
        filename: file,
        experimental: true,
        stage: 0,
        optional: ["runtime"]
    }).code;

    var def = new Function('require', 'module',
        'exports', 'sleep',
        es5_code);
    var module = {
        exports: {}
    };
    def(require, module, module.exports, promise_class);

    return {
        fn: module.exports,
        execute: function (fn, deferred) {
            Promise = promise_class;
            fn().then(function (res) {
                if (!res)
                    deferred.fail('res=' + res);
                deferred.resolve()
            }, function (reason) {
                deferred.fail(reason);
            });
        }
    }
}

function verbose(msg) {
    if (options.verbose)
        console.log(msg);
}

function sleep_callback(ms, callback) {
    if (ms == 0)
        asap(callback);
    else
        setTimeout(callback, ms);
};

function sleep_bluebird(ms) {
    return new Promise_bluebird(function (fullfil) {
        if (ms == 0)
            asap(fullfil);
        else
            setTimeout(fullfil, ms);
    });
};

function sleep_Q(ms) {
    return new Promise_Q(function (fullfil) {
        if (ms == 0)
            asap(fullfil);
        else
            setTimeout(fullfil, ms);
    });
};

runfile(0);
