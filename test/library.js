/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');
var babel = require("babel");

module.exports = (function () {

    var case_description, es6_code;

    var dictionary = new Dictionary()
        .define('CASE', /(.*)/)
        .define('RESULT', /(\d*)/)
        .define('CODE', /([^\u0000]*)/);
    var library = English.library(dictionary)

    .given("I need to transpile $CASE", function (s) {
        case_description = s;
    })

    .when("EcmaScript6=$CODE", function (code) {
        es6_code = code;
    })

    .then("EcmaScript5=$CODE", function (es5_code) {

        var actual_es5_code, expected_es5_code;

        try {
            actual_es5_code = babel.transform(es6_code, {
                filename: case_description,
                compact: false,
                optional: ["es7.asyncFunctions"],
                plugins: ["../src/babel-plugin-async2cbn:before"]
            }).code.replace(/^"use strict";\s*/, '');
            expected_es5_code = babel.transform(es5_code, {
                filename: case_description,
                compact: false,
                optional: [],
                plugins: []
            }).code.replace(/^"use strict";\s*/, '');
        } catch (e) {
            debugger;
            throw e;
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
