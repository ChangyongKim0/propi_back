"use strict";
exports.__esModule = true;
exports._stringfy = exports.ErrorClass = void 0;
var ErrorClass = /** @class */ (function () {
    function ErrorClass(text) {
        this.text = text;
        this.validation_code = "198462735";
    }
    return ErrorClass;
}());
exports.ErrorClass = ErrorClass;
var _stringfy = function (data) {
    if (typeof data === "string") {
        return data;
    }
    return "";
};
exports._stringfy = _stringfy;
