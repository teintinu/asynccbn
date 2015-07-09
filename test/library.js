/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');
var babel = require("babel");

module.exports = (function () {

    var case_description, es5, es6;

    var dictionary = new Dictionary()
        .define('CASE', /(.*)/)
        .define('RESULT', /(.*)/)
        .define('LINE', /(\d*)/)
        .define('COL', /(\d*)/)
        .define('CODE', /([^\u0000]*)/)
        .define('ERROR', /([^\u0000]*)/);

    var library = English.library(dictionary)

    .given("I (need|try) to transpile $CASE", function (s) {
        case_description = s;
    })

    .when("EcmaScript6 at $LINE:$COL = $CODE", function (line, column, code) {
        es6 = {
            code: code,
            line: line,
            column: column
        };
    })

    .then("EcmaScript5 at $LINE:$COL = $CODE", function (line, column, code) {

        es5 = {
            code: code,
            line: line,
            column: column
        };

        var actual_es5_code, expected_es5_code;

        try {
            actual_es5_code = babel.transform(es6.code, {
                filename: case_description,
                compact: true,
                optional: ["es7.asyncFunctions"],
                plugins: ["../src/babel-plugin-async2cbn:before"]
            }).code.replace(/^"use strict";\s*/, '');
        } catch (e) {
            console.error('Error parsing EcmaScript6');
            console.error(es6.code);
            if (e.loc)
                throw new Error(e.message + ' (' + (parseInt(e.loc.line) + parseInt(es6.line) - 1) + ':' + (parseInt(e.loc.column) + parseInt(es6.column) - 1) + ')');
            throw e;
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
                throw new Error(e.message + ' (' + (parseInt(e.loc.line) + parseInt(es5.line) - 1) + ':' + (parseInt(e.loc.column) + parseInt(es5.column) - 1) + ')');
            throw e;
        }

        if (expected_es5_code != actual_es5_code)
            throw new Error(
                       ["transpile fail on " + case_description + ' at line ' + es6.line,
                       "expected:",
                       expected_es5_code,
                       "actual",
                       actual_es5_code].join('\n'));

    })

    .then("eval fn equals to $RESULT", function (expected_result) {

        var body = es5.code.replace(/^\s*function\s*fn\s*\(\s*callback\s*\)\s*\{/m, '').trim();
        var i = body.lastIndexOf('}');
        if (body.substr(i + 1))
            throw "code parsing error: " + body.substr(i + 1);

        body = body.substr(0, i);
        var fn = new Function('divide, callback', body);

        var fail = "callback was not executed at line " + es6.line;
        var divideWithoutTimeout = require('./sample').divideWithoutTimeout;;
        fn(divideWithoutTimeout,
            function (err, actual_result) {
                if (actual_result === undefined)
                    actual_result = '-';
                else if (actual_result === false)
                    actual_result = 'false';
                if (actual_result == expected_result.trim())
                    fail = false;
                else
                    throw new Error('Expected result=' + expected_result + ' actual=' + actual_result + ' at line ' + es6.line);
            });
        if (fail)
            throw fail;
    })

    .then("must report $ERROR", function (expected_error) {

        var fail;
        try {
            babel.transform(es6.code, {
                filename: case_description,
                compact: true,
                optional: ["es7.asyncFunctions"],
                plugins: ["../src/babel-plugin-async2cbn:before"]
            }).code.replace(/^"use strict";\s*/, '');
            fail = new Error("Was excpected report: " + expected_error);
        } catch (e) {
            if (!new RegExp(expected_error).test(e.message))
                fail = new Error("Was excpected report: " + expected_error + "\nbut was reported: " + e.message);
        }
        if (fail)
            throw fail;
    });

    return library;
})();
