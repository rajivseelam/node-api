var _ = require('lodash');
var path = require('path');

module.exports = viewFactory();

function viewFactory (root, prefix, skipClone) {
    root = _.isUndefined(root) ? __dirname : root;
    prefix = _.isUndefined(prefix) ? '' : prefix;
    skipClone = skipClone === true ? true : false;

    function view(name) {
        return function (args) {
            args = Array.prototype.slice.call(arguments, 0);
            
            if (skipClone !== true) {
                args = _.cloneDeep(args);
            }

            var serializer = require(path.join(root, prefix, name));
            return serializer.apply({}, [view.skipClone()].concat(args));
        };
    }

    view.root = function (root) {
        return viewFactory(root, prefix, skipClone)
    };

    view.prefix = function (prefix) {
        return viewFactory(root, prefix, skipClone);
    };

    view.skipClone = function () {
        return viewFactory(root, prefix, true);
    };

    return view;
}