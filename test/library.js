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
        .define('RESULT', /(\d*)/)
        .define('LINE', /(\d*)/)
        .define('COL', /(\d*)/)
        .define('CODE', /([^\u0000]*)/);
    var library = English.library(dictionary)

    .given("I need to transpile $CASE", function (s) {
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
            throw new Error(e.message + ' (' + (parseInt(e.loc.line) + parseInt(es5.line) - 1) + ':' + (parseInt(e.loc.column) + parseInt(es5.column) - 1) + ')');
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
            throw new Error(e.message + ' (' + (parseInt(e.loc.line) + parseInt(es5.line) - 1) + ':' + (parseInt(e.loc.column) + parseInt(es5.column) - 1) + ')');
        }

        if (expected_es5_code != actual_es5_code)
            throw new Error(
                       ["transpile fail on " + case_description,
                       "expected:",
                       expected_es5_code,
                       "actual",
                       actual_es5_code].join('\n'));

    })

    .then("eval fn equals to $RESULT", function (result) {});

    return library;
})();
