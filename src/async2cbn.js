 function visitorFunctionDeclaration(node, throwWithNode) {
     if (node.async) {
         node.async = false;
         if (!node.id.name)
             throwWithNode("async functions must have a name");
         node.id.name+="Async";
         node.params.push({type: 'Identifier', name: 'callback'});
         node.body.body = visitEachRowFunction(node.body.body, 1, throwWithNode).stmts;
     }
 }

 function visitorAwaitExpression(node, parent) {
     //    has_await = true;
     //    var invoke = awaitPath.node.argument;
     //    awaitPath.replace($res);
     //
     //    callback_body = [b.ifStatement($err, //
     //        b.expressionStatement(b.callExpression(b.identifier('callback'), [$err])), //
     //        b.blockStatement([]))];
     //
     //    callback = b.functionExpression(null, [$err, $res], b.blockStatement(callback_body));
     //    invoke.arguments.push(callback);
     //
     //    retBody.push(b.expressionStatement(invoke));
     //
     //    this.traverse(awaitPath);
     //
     //
     //    if (has_await) {
     //        var afterRows = visitEachRowFunction(fnbody.splice(i + 1), res_id + 1);
     //        callback_body[0].alternate.body.push(stmt);
     //        callback_body[0].alternate.body = callback_body[0].alternate.body.concat(afterRows);
     //    } else
     //
 }


 function visitEachRowFunction(fnbody, res_id, throwWithNode) {

     debugger;

     var ret_or_throw = false;

     return {
         stmts: fnbody.reduce(visitStatement, []),
         ret_or_throw: ret_or_throw
     };

     function visitStatement(stmts, stmt) {
         if (ret_or_throw)
             throwWithNode("Dead code after return or throw");
         switch (stmt.type) {
         case 'ReturnStatement':
             stmts.push(transpileReturnStatement(stmt));
             ret_or_throw = true;
             break;
         case 'ThrowStatement':
             stmts.push(transpileThrowStatement(stmt));
             ret_or_throw = true;
             break;
             //     case 'IfStatement':
             //     case 'WhileStatement':
             //     case 'ForStatement':
             //     case 'TryStatement':
         default:
            stmts.push(stmt);
         };

         if (!ret_or_throw)
           stmts.push(transpileReturnStatement());
         return stmts;
     }
 }

 function transpileReturnStatement(stmt) {
     return {
         type: "ReturnStatement",
         range: stmt && stmt.range,
         loc: stmt && stmt.loc,
         argument: {
             type: "CallExpression",
             range: stmt && stmt.range,
             loc: stmt && stmt.loc,
             callee: {
                 type: "Identifier",
                 name: "callback",
                 range: stmt && stmt.range,
                 loc: stmt && stmt.loc,
             },
             arguments: stmt?[
                 {
                     type: "Literal",
                     value: null,
                     raw: "null"
                },
                stmt.argument
            ]:[]
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

 module.exports.visitorFunctionDeclaration = visitorFunctionDeclaration;
 module.exports.visitorAwaitExpression = visitorAwaitExpression;
