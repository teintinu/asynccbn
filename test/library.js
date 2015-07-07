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
        .define('CODE', /([^\0000]*)/);
    var library = English.library(dictionary)

    .given("I need to transpile $CASE", function (s, next) {
        case_description = s;
    })

    .when("EcmaScript6=$CODE", function (code, next) {
        es6_code = code;
    })

    .then("EcmaScript5=$CODE", function (expected_es5_code, next) {

        var actual_es5_code;

        try {
            var result = babel.transform(es6_code, {
                filename: case_description,
                compact: false,
                //features: { "es7.asyncFunctions": true },
                //experimental: true,
                //stage: 1,
                optional: ["es7.asyncFunctions"],
                plugins: ["../src/babel-plugin-async2cbn:before"]
            });
        } catch (e) {
            debugger;
            throw e;
        }
        actual_es5_code = result.code.replace(/^"use strict";\s*/, '');

        if (expected_es5_code.trim() != actual_es5_code.trim())
            throw new Error(
                       ["transpile fail on " + case_description,
                       "expected:",
                       expected_es5_code,
                       "actual",
                       actual_es5_code].join('\n'));

    });

    return library;
})();
