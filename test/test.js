/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.ScenarioLevelPlugin.init();

new Yadda.FeatureFileSearch(__dirname + '/features').each(function (file) {
    featureFile(file, function (feature) {

        var library = require('./library');
        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function (scenario, done) {
            var idx = -1;
            exec_next_step();

            function exec_next_step(err) {
                idx++;
                if (err || idx >= scenario.steps.length)
                    done(err);
                else
                    yadda.run(scenario.steps[idx], exec_next_step);
            }
        });
    });
});
