/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');
var babel = require("babel");
require('colors');
var jsdiff = require('diff');

var sample = require('./sample');

module.exports = (function () {

    var case_description, es5, es7;

    var dictionary = new Dictionary()
        .define('CASE', /(.*)/)
        .define('RESULT', /(.*)/)
        .define('LINE', /(\d*)/)
        .define('COL', /(\d*)/)
        .define('CODE', /([^\u0000]*)/)
        .define('ERROR', /([^\u0000]*)/);

    var library = English.library(dictionary)

    .given("I (?:need|try) to transpile $CASE", function (s, next) {
        case_description = s;
        next();
    })

    .when("EcmaScript7 at $LINE:$COL = $CODE", function (line, column, code, next) {
        es7 = {
            code: code,
            line: line,
            column: column
        };
        next();
    })

    .then("EcmaScript5 at $LINE:$COL = $CODE", function (line, column, code, next) {

        try {
            es5 = {
                code: code,
                line: line,
                column: column
            };

            var actual_es5_code, expected_es5_code;

            try {
                actual_es5_code = babel.transform(es7.code, {
                    filename: case_description,
                    compact: true,
                    optional: ["es7.asyncFunctions"],
                    plugins: ["../src/babel-plugin-async2cbn:before"]
                }).code.replace(/^"use strict";\s*/, '');
            } catch (e) {
                console.error('Error parsing EcmaScript7');
                console.error(es7.code);
                if (e.loc)
                    return next(new Error(e.message + ' (' + (parseInt(e.loc.line) + parseInt(es7.line) - 1) + ':' + (parseInt(e.loc.column) + parseInt(es7.column) - 1) + ')'));
                return next(e);
            }
            try {
                expected_es5_code = babel.transform(es5.code, {
                    filename: case_description,
                    compact: true,
                    optional: [],
                    plugins: []
                }).code.replace(/^"use strict";\s*/, '');
            } catch (e) {
                console.error('Error parsing EcmaScript5');
                console.error(es5.code);
                if (e.loc)
                    return next(new Error(e.message + ' (' + (parseInt(e.loc.line) + parseInt(es5.line) - 1) + ':' + (parseInt(e.loc.column) + parseInt(es5.column) - 1) + ')'));
                return next(e);
            }

            if (expected_es5_code != actual_es5_code) {

                var msg = ["transpile fail on " + case_description + ' at line ' + es7.line + '\n'];
                var diff = jsdiff.diffChars(actual_es5_code, expected_es5_code);

                diff.forEach(function (part) {
                    var color = part.added ? 'cyan' :
                        part.removed ? 'magenta' : 'gray';
                    msg.push(part.value[color]);
                });

                msg.push(' '.black);
                return next(new Error(msg.join('')));
            }
            next();
        } catch (e) {
            next(e);
        }
    })

    .then("eval fn equals to $RESULT", function (expected_result, next) {

        try {
            var body = es5.code.replace(/^\s*function\s*fn\s*\(\s*callback\s*\)\s*\{/m, '').trim();
            var i = body.lastIndexOf('}');
            if (body.substr(i + 1))
                return next("code parsing error: " + body.substr(i + 1));

            body = body.substr(0, i);
            var fn = new Function('divide, callback', body);

            var fail = "callback was not executed at line " + es7.line;
            fn(sample.divideWithoutTimeout,
                function (err, actual_result) {
                    if (actual_result === undefined)
                        actual_result = '-';
                    else if (actual_result === false)
                        actual_result = 'false';
                    if (actual_result == expected_result.trim())
                        fail = false;
                    else
                        fail = new Error('Expected result=' + expected_result + ' actual=' + actual_result + ' at line ' + es7.line);
                });
            if (fail)
                return next(fail);
            fn(sample.divideWithTimeout,
                function (err, actual_result) {
                    if (actual_result === undefined)
                        actual_result = '-';
                    else if (actual_result === false)
                        actual_result = 'false';
                    if (actual_result == expected_result.trim())
                        fail = false;
                    else
                        return next(new Error('Expected result=' + expected_result + ' actual=' + actual_result + ' at line ' + es7.line));
                    next();
                });
        } catch (e) {
            next(e);
        }
    })

    .then("must report $ERROR", function (expected_error, next) {

        try {
            babel.transform(es7.code, {
                filename: case_description,
                compact: true,
                optional: ["es7.asyncFunctions"],
                plugins: ["../src/babel-plugin-async2cbn:before"]
            }).code.replace(/^"use strict";\s*/, '');
            return next(new Error("Was excpected report: " + expected_error));
        } catch (e) {
            if (!new RegExp(expected_error).test(e.message))
                return next(new Error("Was excpected report: " + expected_error + "\nbut was reported: " + e.message));
        }
        next();
    });

    return library;
})();
