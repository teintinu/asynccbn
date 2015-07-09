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
            exec(0);
            function exec(idx){
                if (idx>=scenario.steps.length)
                    done();
                else
                    yadda.run(scenario.steps[idx], function(){
                        exec(idx+1);
                    });
            }
        });
    });
});
