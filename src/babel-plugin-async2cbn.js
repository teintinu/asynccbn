var async2cbn = require("./async2cbn");

module.exports = function (ref) {
    return new ref.Plugin("async2cbn", {
        visitor: {
            FunctionDeclaration: function (node, parent) {
                var _this = this;
                return async2cbn.visitorFunctionDeclaration(node, function (msg) {
                    _this.errorWithNode(msg);
                });
            },
            AwaitExpression: function (node, parent) {
                var parents = [];
                var _this = this;
                var p = node._paths[0].parentPath;
                do {
                    p = p.parentPath;
                    parents.push(p.node);
                } while (p.node.type != 'FunctionExpression' && p.node.type != 'FunctionDeclaration')
                return async2cbn.visitorAwaitExpression(node, parents, function (msg) {
                    _this.errorWithNode(msg);
                });
            }
        }
    });
}
