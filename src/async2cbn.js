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
                if (ret_or_throw === 'maybe')
                    ret_or_throw = false;
                else
                    throwWithNode(stmt, "Dead code");
            var r = visitStatement(stmt);
            actual.push(r.stmt);
            if (r.ret_or_throw)
                ret_or_throw = r.ret_or_throw;
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
        switch (stmt.type) {
        case 'ReturnStatement':
            return visitReturnStatement(stmt);
        case 'ThrowStatement':
            return visitThrowStatement(stmt);
        case "ExpressionStatement":
            return visitExpressionStatement(stmt);
        case 'VariableDeclaration':
            return visitVariableDeclaration(stmt);
        case 'IfStatement':
            return visitIfStatement(stmt);

        case 'WhileStatement':
        case 'ForStatement':
        case 'TryStatement':
        case 'SwitchStatement':
            throw "TODO";
        default:
            if (getAwaitInfo(stmt))
                throwWithNode(stmt.node, "Unsuported combination with await");
            return {
                stmt: stmt,
                ret_or_throw: false
            };
        };
    }

    function visitReturnStatement(stmtReturn) {
        var await_info = getAwaitInfo(stmtReturn.argument);

        if (!await_info)
            return {
                stmt: transpileReturnStatement(stmtReturn),
                ret_or_throw: true,
                afterAwait: false
            };

        var expr_info = visitExpressionWithAway(stmtReturn, stmtReturn.argument, await_info);

        if (expr_info.isAwaitExpression && expr_info.afterAwait.length == 1)
            expr_info.lastcall.arguments[expr_info.lastcall.arguments.length - 1] = {
                type: 'Identifier',
                name: 'callback'
            };
        else
            expr_info.afterAwait.push(transpileReturnStatement(stmtReturn));

        return {
            stmt: expr_info.stmt,
            ret_or_throw: true,
            afterAwait: true
        };
    }

    function visitThrowStatement(stmtThrow) {
        var await_info = getAwaitInfo(stmtThrow.argument);
        if (await_info)
            throwWithNode(await_info.awaitPath.node, "Can't throw await expression");
        return {
            stmt: transpileThrowStatement(stmtThrow),
            ret_or_throw: true
        };
    }

    function visitExpressionStatement(stmtExpr) {
        var await_info = getAwaitInfo(stmtExpr.expression);
        if (!await_info)
            return {
                stmt: stmtExpr
            };

        var expr_info = visitExpressionWithAway(stmtExpr, stmtExpr.expression, await_info);
        if (!expr_info.isAwaitExpression)
            expr_info.afterAwait.push(stmtExpr);

        return {
            stmt: expr_info.stmt,
            afterAwait: expr_info.afterAwait,
            ret_or_throw: false
        };
    }

    function visitVariableDeclaration(stmtVar) {
        var r;

        debugger;
        stmtVar.declarations = stmtVar.declarations.reduce(
            function (no_await_decls, decl) {
                var await_info;
                if (decl.init && (await_info = getAwaitInfo(decl.init))) {

                    var expr_info = visitExpressionWithAway(stmtVar, decl.init, await_info, decl.id);
                    if (!expr_info.isAwaitExpression)
                        no_await_decls.push(decl);
                    if (r) {
                        r.afterAwait.push(expr_info.stmt);
                    } else r = {
                        stmt: expr_info.stmt
                    }
                    r.afterAwait = expr_info.afterAwait;

                } else no_await_decls.push(decl);
                return no_await_decls;
            }, []);

        if (r && stmtVar.declarations.length)
            r.afterAwait.push(stmtVar);

        if (!r)
            r = {
                stmt: stmtVar
            }
        return r;

    }

    function visitIfStatement(stmtIf) {
        var await_info = {
            test: getAwaitInfo(stmtIf.test),
            consequent: visitIfStatementPart(stmtIf, stmtIf.consequent),
            alternate: visitIfStatementPart(stmtIf, stmtIf.alternate)
        };

        var r;
        if (await_info.test) {
            var expr_info = visitExpressionWithAway(stmtIf, stmtIf.test, await_info.test);
            expr_info.afterAwait.push(stmtIf);
            r = {
                stmt: expr_info.stmt,
                afterAwait: expr_info.afterAwait
            }
        }

        //        stmtIf.consequent.body = await_info.consequent.stmtsBeforeAwait;
        //

        if (await_info.consequent.has_await && !await_info.alternate.has_await) {
            if (!stmtIf.alternate)
                throwWithNode(stmtIf, "else is mandatory when await used in consequent block");
            visitIfStatementPartWithAwait(stmtIf, 'consequent', await_info.consequent);
            if (stmtIf.alternate)
                stmtIf.alternate = await_info.alternate.part_stmt;
        } else if (await_info.consequent.has_await && await_info.alternate.has_await)
            throw "TODO";
        else if (await_info.consequent.has_await && await_info.alternate.has_await)
            throw "TODO";
        else {
            stmtIf.consequent = await_info.consequent.part_stmt;
            if (stmtIf.alternate)
                stmtIf.alternate = await_info.alternate.part_stmt;
        }

        if (!r)
            r = {
                stmt: stmtIf
            }

        if (await_info.consequent.ret_or_throw && (!stmtIf.alternate || await_info.alternate.ret_or_throw))
            r.ret_or_throw = 'maybe';

        return r;

        function visitIfStatementPart(ifStmt, part) {
            var rp;
            if (!part)
                return {
                    block_mode: false,
                    has_await: false
                };
            if (part.type == "BlockStatement") {
                rp = visitBlockStatement(part.body);
                rp.block_mode = true;
                rp.has_await = !!rp.stmtsAfterAwait;
                rp.part_stmt = rp.stmtsBeforeAwait;
                part.body = rp.stmtsBeforeAwait;
            } else {
                rp = visitStatement(part);
                rp.block_mode = false;
                rp.has_await = !!rp.afterAwait;
                rp.part_stmt = rp.stmt;
            }
            return rp;
        }

        function visitIfStatementPartWithAwait(ifStmt, partname, await_info) {
            if (await_info.block_mode) {
                if (r)
                    throw "TODO await in test";
                if (!await_info.ret_or_throw)
                    throw "TODO";
                r = {
                    stmt: ifStmt
                };
            } else {
                if (r)
                    throw "TODO await in test";
                if (!await_info.ret_or_throw)
                    throw "TODO";
                r = {
                    stmt: ifStmt
                };
                ifStmt[partname] = await_info.stmt;
                //        if (!await_info.alternate || !await_info.alternate.stmtsAfterAwait) {
                //            r.stmt = await_info.consequent.stmt;
                //            stmtIf.consequent = await_info.consequent.afterAwait;
                //            await_info.consequent.afterAwait.push(stmtIf);
                //            r.afterAwait = stmtIf.consequent;
                //        }
            }
        }
    }

    function visitExpressionWithAway(stmt, expr, await_info, res$node) {
        var r = {
            stmt: {
                type: 'ExpressionStatement',
                loc: stmt.loc,
                range: stmt.range,
                expression: await_info.call
            },
            isAwaitExpression: expr.type == 'AwaitExpression'
        };
        if (!r.isAwaitExpression)
            res$node = undefined;
        while (await_info) {
            var cb = createCallback(stmt, res$node);
            await_info.call.arguments.push(cb.fn);
            await_info.awaitPath.replaceInline(cb.res$);
            awaits.splice(await_info.idx, 1);
            if (r.afterAwait)
                r.afterAwait.push({
                    type: 'ExpressionStatement',
                    loc: stmt.loc,
                    range: stmt.range,
                    expression: await_info.call
                });
            r.res$ = cb.res$;
            r.lastcall = await_info.call;
            r.afterAwait = cb.body;
            await_info = getAwaitInfo(expr);
        }
        return r;
    }

    function getAwaitInfo(node) {
        var await_info;
        awaits.some(function (paths, idx) {
            return paths.some(function (path) {
                if (path.node == node) {
                    await_info = {
                        paths: paths,
                        stmt: path,
                        idx: idx,
                        awaitPath: paths.length ? paths[0] : null,
                        parentPath: paths.length >= 2 ? paths[1] : null
                    };
                    if (await_info.awaitPath)
                        await_info.call = await_info.awaitPath.node.argument;
                    if (!await_info.call || await_info.call.type != 'CallExpression')
                        throwWithNode(await_info.awaitPath.node, "AwaitExpression must invoke a function");
                    return true;
                }
            })
        });
        return await_info;
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

    function createCallback(ref, res$node) {
        var id = ++gen;
        var res$ = res$node || {
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
