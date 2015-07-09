var async2cbn = require("./async2cbn");

module.exports = function (ref) {
    return new ref.Plugin("async2cbn", {
        visitor: {
            FunctionDeclaration: {
                exit: function (node, parent) {
                    var _this = this;
                    var awaits = node.__awaits || [];
                    delete node.__awaits;
                    return async2cbn.visitorFunctionDeclaration(node, ref.types, awaits, function (node, msg) {
                        //TODO dont use this
                        throw _this.errorWithNode(msg);
                    });
                }
            },
            AwaitExpression: function (node, parent) {
                var paths = [];
                var _this = this;
                var p = node._paths[0].parentPath;
                var n;
                while (p.node.type != 'FunctionExpression' && p.node.type != 'FunctionDeclaration') {
                    paths.push(p);
                    p = p.parentPath;
                }
                p.node.__awaits = (p.node.__awaits || []);
                p.node.__awaits.push(paths);
            }
        }
    });
}
