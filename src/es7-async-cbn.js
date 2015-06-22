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
        visitFunctionDeclaration: function (functionPath) {
            var node = functionPath.node;
            if (node.async) {
                node.async = false;
                node.params.push(b.identifier('callback'));

                node.body.body = visitEachRowFunction(node, node.body.body);

                functionPath.replace(node);
            }
            this.traverse(functionPath);
        }
    });
    return source_ast;

    function visitEachRowFunction(fnNode, fnbody) {
        var curr_function = fnNode;
        var retBody = [];
        for (var i = 0; i < fnbody.length; i++) {
            var stmt = fnbody[i];

            var has_await = false;
            recast.visit(stmt, {
                visitReturnStatement: function (returnPath) {
                    returnPath.replace(b.expressionStatement(b.callExpression(b.identifier('callback'), [b.identifier('null'), returnPath.node.argument
                   ])));
                    this.traverse(returnPath);
                },
                visitAwaitExpression: function (awaitPath) {
                    has_await = true;
                    var invoke = awaitPath.node.argument;
                    awaitPath.replace(b.identifier('$res'));

                    var callback_body = [b.ifStatement(b.identifier('$err'), //
                            b.returnStatement(b.callExpression(b.identifier('callback'), [b.identifier('$err')]))), //
                                         stmt];

                    var callback = b.functionExpression(null, [b.identifier('$err'), b.identifier('$res')], b.blockStatement(callback_body));
                    invoke.arguments.push(callback);

                    retBody.push(b.expressionStatement(invoke));

                    this.traverse(awaitPath);
                }
            });
            if (!has_await)
                retBody.push(stmt);
        }
        return retBody;
    }
}

module.exports.transform_file = transform_file;
module.exports.transform_string = transform_string;
module.exports.transform_ast = transform_ast;
