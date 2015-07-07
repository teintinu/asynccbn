var async2cbn = require("./async2cbn");

module.exports = function (ref) {
    return new ref.Plugin("async2cbn", {
        visitor: {
            FunctionDeclaration: function (node, parent) {
                return async2cbn.visitorFunctionDeclaration(node, this.errorWithNode);
            },
            AwaitExpression: function (node, parent) {
                var parents = this.getParents;
                return async2cbn.visitorFunctionDeclaration(node, parents, this.errorWithNode);
            }
        }
    });
}
