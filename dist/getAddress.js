"use strict";
exports.__esModule = true;
exports.getAddress = void 0;
var fs = require("fs");
var getApiDataFromServer_1 = require("./getApiDataFromServer");
var utils_1 = require("./utils");
var getDate_1 = require("./getDate");
var convertAddressToPnu = function (ld_code, addr) {
    // console.log(ld_code, addr);
    var pnu = ld_code;
    pnu += addr[0] == "산" ? "2" : "1";
    var no = addr.replace(/[가-힣]/g, "");
    if (no.includes("-")) {
        pnu += (0, getDate_1.fillZeros)(no.split("-")[0], 4) + (0, getDate_1.fillZeros)(no.split("-")[1], 4);
    }
    else {
        pnu += (0, getDate_1.fillZeros)(no, 4) + "0000";
    }
    return pnu;
};
var getAddress = function (lat, lng) {
    return (0, getApiDataFromServer_1.getApiDataFromServer)("geocoder", [lng + "," + lat], false)
        .then(function (data) {
        return convertAddressToPnu(data[""]["level4LC"]["_cdata"], data[""]["level5"]["_cdata"]);
    })["catch"](function (err) {
        console.log("getAddress.js:getAddress");
        console.log("LAT : " + lat + "; LNG : " + lng);
        // console.log(err);
        return new utils_1.ErrorClass("주소를 받아오지 못했어요.");
    });
};
exports.getAddress = getAddress;
