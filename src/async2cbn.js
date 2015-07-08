function visitorFunctionDeclaration(node, types, awaits, throwWithNode) {
    if (node.async) {
        node.async = false;
        node.params.push({
            type: 'Identifier',
            name: 'callback'
        });
        node.body.body = visitEachRowFunction(node.body.body, types, awaits, throwWithNode);
    }
}

function visitEachRowFunction(fnbody, types, awaits, throwWithNode) {

    var gen = 0,
        has_catch = false,
        has_finally = false,
        err$ = {
            type: 'Identifier',
            name: 'err$'
        };

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
    } else if (r.stmtsAfterAwait && r.stmtsAfterAwait.length == 2) {
        var last = r.stmtsAfterAwait[r.stmtsAfterAwait.length - 1];
        var expr = last.expression;
        if (last.type == 'ExpressionStatement' && expr.type == 'CallExpression' && expr.callee.name == 'callback' && ['Identifier', 'Literal'].indexOf(expr.arguments[1].type) >= 0) {
            r.stmtsAfterAwait.splice(0, 2, transpileReturnStatement({
                loc: last.loc,
                range: last.range,
                argument: expr.arguments[1]
            }, err$));
        }
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
        var await_info;
        awaits.some(function (paths, idx) {
            return paths.some(function (path) {
                if (path.node == stmt) {
                    await_info = {
                        paths: paths,
                        stmt: path,
                        idx: idx
                    };
                    return true;
                }
            })
        });
        if (await_info)
            return visitStatementWithAwait(stmt, await_info);
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

    function visitStatementWithAwait(stmt, await_info) {
        var paths = await_info.paths;
        var awaitPath = paths.length ? paths[0] : {};
        var parentPath = paths.length >= 2 ? paths[1] : {};

        if (awaitPath.node.type != 'AwaitExpression')
            throwWithNode(awaitPath.node, "AwaitExpression can\'t be transpiled");
        var call = awaitPath.node.argument;
        if (call.type != 'CallExpression')
            throwWithNode(awaitPath.node, "AwaitExpression must invoke a funciton");

        switch (parentPath.node.type) {
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

        case "ExpressionStatement":
            var cb = createCallback(awaitPath.node)

            call.arguments.push(cb.fn);

            parentPath.node.argument = call;

            return {
                stmt: {
                    type: 'ExpressionStatement',
                    expression: call
                },
                afterAwait: cb.body,
                ret_or_throw: false
            };

        case 'ThrowStatement':
            throwWithNode(awaitPath.node, "Can't throw await expression");

        case 'VariableDeclarator':
            var cb = createCallback(awaitPath.node, parentPath.node.id);
            var varDeclaration = paths[2];
            if (varDeclaration.node.declarations.length > 1) {
                parentPath.dangerouslyRemove();
                cb.body.push(varDeclaration.node);
            }
            call.arguments.push(cb.fn);
            return {
                stmt: {
                    type: 'ExpressionStatement',
                    expression: call
                },
                afterAwait: cb.body,
                ret_or_throw: false
            };

        case 'IfStatement':
        case 'WhileStatement':
        case 'ForStatement':
        case 'TryStatement':
        case 'SwitchStatement':
            throw "TODO";
        case "BinaryExpression":
        case "UnaryExpression":
        case "CallExpression":
            var cb = createCallback(awaitPath.node)
            call.arguments.push(cb.fn);
            awaitPath.replaceInline(cb.res$);
            awaits.splice(await_info.idx, 1);
            var r = visitStatement(await_info.stmt.node);
            cb.body.push(r.stmt);
            return {
                stmt: {
                    type: 'ExpressionStatement',
                    expression: call
                },
                afterAwait: r.afterAwait || cb.body,
                ret_or_throw: r.ret_or_throw
            };
        default:
            throwWithNode(awaitPath.node, "Unsuported combination with await");
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

    function createCallback(ref, res) {
        var id = ++gen;
        var res$ = res || {
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
