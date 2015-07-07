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
        if (r.stmtsAfterAwait) {
            if (r.stmtsAfterAwait.length == 1)
                r.stmtsAfterAwait[0] = transpileReturnStatement(null, r.stmtsAfterAwait[0].test);
            else
                r.stmtsAfterAwait.push(transpileReturnStatement());
        } else
            r.stmtsBeforeAwait.push(transpileReturnStatement());
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
        default:
            return {
                stmt: stmt,
                ret_or_throw: false
            };
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

            return {
                stmt: {
                    type: 'ExpressionStatement',
                    expression: call
                },
                ret_or_throw: true
            };

        case 'ThrowStatement':
            throwWithNode(awaitNode, "Can't throw await expression");

        case 'IfStatement':
        case 'WhileStatement':
        case 'ForStatement':
        case 'TryStatement':
        case 'SwitchStatement':
            throw "TODO";
        default:
            var cb = createCallback(awaitNode)

            call.arguments.push(cb.fn);

            parentNode.argument = call;

            return {
                stmt: {
                    type: 'ExpressionStatement',
                    expression: call
                },
                afterAwait: cb.body,
                ret_or_throw: false
            };
        };

    }

    function transpileReturnStatement(stmt, err) {
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
                    err ? err : {
                        type: "Literal",
                        value: null,
                        raw: "null"
                },
                stmt.argument
                ] : err ? [err] : []
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

    function createCallback(ref) {
        var id = ++gen;
        var err$ = {
            type: "Identifier",
            name: "err$" + id
        };
        var res$ = {
            type: "Identifier",
            name: "res$" + id
        };
        var body = [
            {
                type: "IfStatement",
                loc: ref.loc,
                range: ref.range,
                test: err$,
                consequent: transpileThrowStatement({
                    loc: ref.loc,
                    range: ref.range,
                    argument: err$
                })
            }
        ];
        var fn = {
            type: "FunctionExpression",
            id: null,
            params: [err$, res$],
            defaults: [],
            body: {
                type: "BlockStatement",
                body: body
            },
            generator: false,
            expression: false,
        };
        return {
            fn: fn,
            body: body,
            err$: err$,
            res$: res$
        }
    }
}

module.exports.visitorFunctionDeclaration = visitorFunctionDeclaration;
