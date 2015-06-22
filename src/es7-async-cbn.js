var fs = require('fs');
var assert = require("assert");
var recast = require('recast');
var types = recast.types;
var n = types.namedTypes;
var b = types.builders;


function transform_file(inputFile, outputFile, options) {
    var input = fs.readFileSync(inputFile, {
        encoding: 'utf-8'
    });
    var output = transform_string(inputFile, input, options);
    fs.writeFileSync(outputFile, output.code, {
        encoding: 'utf-8'
    });
    if (options.sourceFileName && options.sourceMapName)
        fs.writeFileSync(options.sourceMapName, output.map.mappings, {
            encoding: 'utf-8'
        });
}

function transform_string(inputFileName, sourceCode, options) {
    if (!options)
        options = {
            range: true
        };
    var source_ast = recast.parse(sourceCode, options);
    var result_ast = transform_ast(inputFileName, source_ast);

    return recast.print(result_ast, options);
}

function transform_ast(inputFileName, source_ast) {

    recast.visit(source_ast, {
        visitAsync: function (path) {},
    });
    return source_ast;
}

module.exports.transform_file = transform_file;
module.exports.transform_string = transform_string;
module.exports.transform_ast = transform_ast;
