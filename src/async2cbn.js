function visitorFunctionDeclaration(node, awaits, throwWithNode) {
    if (node.async) {
        node.async = false;
        node.params.push({
            type: 'Identifier',
            name: 'callback'
        });
        node.body.body = visitEachRowFunction(node.body.body, awaits, throwWithNode);
    }
}

function visitEachRowFunction(fnbody, awaits, throwWithNode) {

    var gen = 0,
        has_catch = false,
        has_finally = false;

    var r = visitBlockStatement(fnbody);
    if (!r.ret_or_throw) {
        (r.stmtsAfterAwait || r.stmtsBeforeAwait).push(transpileReturnStatement());
        r.ret_or_throw = true;
    }
    return r.stmtsBeforeAwait;

    function visitBlockStatement(body) {

        var ret_or_throw = false;

        var stmtsBeforeAwait = [],
            stmtsAfterAwait;

        var actual = stmtsBeforeAwait;

        body.forEach(function (stmt) {
            if (ret_or_throw)
                throwWithNode(stmt, "Dead code");
            var r = visitStatement(stmt);
            actual.push(r.stmt);
            if (r.ret_or_throw)
                ret_or_throw = true;
            if (r.afterAwait) {
                stmtsAfterAwait = r.afterAwait;
                actual = stmtsAfterAwait;
            }
        });

        return {
            stmtsBeforeAwait: stmtsBeforeAwait,
            stmtsAfterAwait: stmtsAfterAwait,
            ret_or_throw: ret_or_throw
        };
    }

    function visitStatement(stmt) {
        var await_nodes;
        awaits.some(function (nodes) {
            return nodes.some(function (node) {
                if (node == stmt) {
                    await_nodes = nodes;
                    return true;
                }
            })
        });
        if (await_nodes)
            return visitStatementWithAwait(stmt, await_nodes);
        else
            return visitStatementWithoutAwait(stmt);
    }

    function visitStatementWithoutAwait(stmt) {
        switch (stmt.type) {
        case 'ReturnStatement':
            return {
                stmt: transpileReturnStatement(stmt),
                ret_or_throw: true
            };

        case 'ThrowStatement':
            return {
                stmt: transpileThrowStatement(stmt),
                ret_or_throw: true
            };

        case 'IfStatement':
            var consequent, alternative;
            if (stmt.consequent.type == "BlockStatement") {
                consequent = visitBlockStatement(stmt.consequent.body)
                stmt.consequent.body = consequent.stmtsBeforeAwait;
            } else {
                consequent = visitStatement(stmt.consequent)
                stmt.consequent = consequent.stmt;
            }
            if (stmt.alternative)
                throw "TODO";
            if (consequent.stmtsAfterAwait || alternative && alternative.stmtsAfterAwait)
                throw "TODO";
            //{
            //                if (stmt.alternative.type == "BlockStatement") {
            //                    alternative = visitBlockStatement(stmt.alternative.body)
            //                    stmt.alternative.body = consequent.stmtsBeforeAwait;
            //                } else {
            //                    alternative = visitStatement(stmt.alternative)
            //                    stmt.alternative = consequent.stmt;
            //                }
            //            }

            var ifRet = {
                stmt: stmt,
                ret_or_throw: consequent.ret_or_throw && (!alternative || alternative.ret_or_throw)
            };
            //if (consequent.ret_or_throw && (!alternative || alternative.ret_or_throw))
            //    ret_or_throw = true;
            return ifRet;
        case 'WhileStatement':
        case 'ForStatement':
        case 'TryStatement':
        case 'SwitchStatement':
            throw "TODO";
        };
        return {
            stmt: stmt,
            ret_or_throw: false
        };
    }

    function visitStatementWithAwait(stmt, nodes) {
        var awaitNode = nodes.length ? nodes[0] : {};
        var parentNode = nodes.length >= 2 ? nodes[1] : {};
        if (awaitNode.type != 'AwaitExpression')
            throwWithNode(awaitNode, "AwaitExpression can\'t be transpiled");

        var call = awaitNode.argument;


        switch (parentNode.type) {
        case 'ReturnStatement':
            call.arguments.push({
                type: 'Identifier',
                name: 'callback'
            });

            parentNode.argument = call;

            return {
                stmt: parentNode,
                ret_or_throw: true
            };

        case 'ThrowStatement':
            throw "TODO";
            return {
                stmt: transpileThrowStatement(stmt),
                ret_or_throw: true
            };

        case 'IfStatement':
            throw "TODO";
            var consequent, alternative;
            if (stmt.consequent.type == "BlockStatement") {
                consequent = visitBlockStatement(stmt.consequent.body)
                stmt.consequent.body = consequent.stmtsBeforeAwait;
            } else {
                consequent = visitStatement(stmt.consequent)
                stmt.consequent = consequent.stmt;
            }
            if (stmt.alternative)
                throw "TODO";
            if (consequent.stmtsAfterAwait || alternative && alternative.stmtsAfterAwait)
                throw "TODO";
            //{
            //                if (stmt.alternative.type == "BlockStatement") {
            //                    alternative = visitBlockStatement(stmt.alternative.body)
            //                    stmt.alternative.body = consequent.stmtsBeforeAwait;
            //                } else {
            //                    alternative = visitStatement(stmt.alternative)
            //                    stmt.alternative = consequent.stmt;
            //                }
            //            }

            var ifRet = {
                stmt: stmt,
                ret_or_throw: consequent.ret_or_throw && (!alternative || alternative.ret_or_throw)
            };
            //if (consequent.ret_or_throw && (!alternative || alternative.ret_or_throw))
            //    ret_or_throw = true;
            return ifRet;
        case 'WhileStatement':
        case 'ForStatement':
        case 'TryStatement':
        case 'SwitchStatement':
            throw "TODO";
        };
        throw "TODO";
        return {
            stmt: stmt,
            ret_or_throw: false
        };

    }

    function transpileReturnStatement(stmt) {
        return {
            type: "ExpressionStatement",
            range: stmt && stmt.range,
            loc: stmt && stmt.loc,
            expression: {
                type: "CallExpression",
                range: stmt && stmt.range,
                loc: stmt && stmt.loc,
                callee: {
                    type: "Identifier",
                    name: "callback",
                    range: stmt && stmt.range,
                    loc: stmt && stmt.loc,
                },
                arguments: stmt ? [
                    {
                        type: "Literal",
                        value: null,
                        raw: "null"
                },
                stmt.argument
            ] : []
            }
        };
    }

    function transpileThrowStatement(stmt) {
        return {
            type: "ReturnStatement",
            range: stmt.range,
            loc: stmt.loc,
            argument: {
                type: "CallExpression",
                range: stmt.range,
                loc: stmt.loc,
                callee: {
                    type: "Identifier",
                    name: "callback",
                    range: stmt.range,
                    loc: stmt.loc,
                },
                arguments: [
                stmt.argument
            ]
            }
        };
    }

    //    function createCallback() {
    //        var id = gen++;
    //        var cb = {
    //            type: "FunctionExpression",
    //            id: null,
    //            params: [
    //                {
    //                    "type": "Identifier",
    //                    "name": "err$" + id
    //                            },
    //                {
    //                    "type": "Identifier",
    //                    "name": "res$" + id
    //                }
    //            ],
    //            "defaults": [],
    //            "body": {
    //                "type": "BlockStatement",
    //                "body": []
    //            },
    //            "generator": false,
    //            "expression": false,
    //        }
    //
    //
    //
    //
    //
    //
    //        callback_body = [b.ifStatement($err, //
    //            b.expressionStatement(b.callExpression(b.identifier('callback'), [$err])), //
    //            b.blockStatement([]))];
    //
    //        callback = b.functionExpression(null, [$err, $res], b.blockStatement(callback_body));
    //
    //    }

}

module.exports.visitorFunctionDeclaration = visitorFunctionDeclaration;
