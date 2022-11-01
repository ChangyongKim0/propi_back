"use strict";
exports.__esModule = true;
exports.getDate = exports.fillZeros = void 0;
var fillZeros = function (data, length) {
    if (data.length < length) {
        return (0, exports.fillZeros)("0" + data, length);
    }
    return data;
};
exports.fillZeros = fillZeros;
var getDate = function () {
    var now = new Date(Date.now());
    return (now.getFullYear().toString() +
        (0, exports.fillZeros)((now.getMonth() + 1).toString(), 2) +
        (0, exports.fillZeros)(now.getDate().toString(), 2));
};
exports.getDate = getDate;
