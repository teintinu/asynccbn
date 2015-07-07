var async2cbn = require("./async2cbn");

module.exports = function (ref) {
    return new ref.Plugin("async2cbn", {
        visitor: {
            FunctionDeclaration: {
                exit: function (node, parent) {
                    var _this = this;
                    var awaits = node.__awaits || [];
                    delete node.__awaits;
                    return async2cbn.visitorFunctionDeclaration(node, awaits, function (node, msg) {
                        //TODO dont use this
                        _this.errorWithNode(msg);
                    });
                }
            },
            AwaitExpression: function (node, parent) {
                var nodes = [];
                var _this = this;
                var p = node._paths[0].parentPath;
                var n;
                while (p.node.type != 'FunctionExpression' && p.node.type != 'FunctionDeclaration') {
                    n = p.node;
                    nodes.push(n);
                    p = p.parentPath;
                }
                p.node.__awaits = (p.node.__awaits || []);
                p.node.__awaits.push(nodes);
            }
        }
    });
}
