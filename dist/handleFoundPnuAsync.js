"use strict";
exports.__esModule = true;
exports.handleFoundPnuAsync = exports.searchFoundPnu = void 0;
var shortcut_1 = require("./shortcut");
var getDate_1 = require("./getDate");
var fs = require("fs");
var getApiDataFromServer_1 = require("./getApiDataFromServer");
// const findPnuUnder100Async = (pnu) => {
//   if (pnu.length == 8) {
//     return Promise.resolve(pnu);
//   }
//   return getApiDataFromServer("land_number", pnu.slice(0, -1)).then((data) => {
//     // console.log(data);
//     return Object.keys(data)[0] == "100"
//       ? Promise.resolve(pnu)
//       : new Promise((resolve) =>
//           setTimeout(() => {
//             resolve(findPnuUnder100Async(pnu.slice(0, -1)));
//           }, 0)
//         );
//   });
// };
var findPnuUnder100Async = function (pnu) {
    if (pnu.length == 11) {
        return Promise.resolve(pnu);
    }
    return (0, getApiDataFromServer_1.getApiDataFromServer)("land_number", pnu.slice(0, -1)).then(function (data) {
        console.log(data);
        return Object.keys(data)[0] == "100"
            ? pnu
            : findPnuUnder100Async(pnu.slice(0, -1));
    });
};
var _updateFoundPnu = function (found_pnu) {
    var file_path = shortcut_1.DATA_PATH + "land_number" + "/found_pnu_list.json";
    var found_pnu_list = JSON.parse(fs.readFileSync(file_path));
    if (found_pnu_list.date != (0, getDate_1.getDate)()) {
        found_pnu_list = { date: (0, getDate_1.getDate)(), data: [] };
    }
    if (!found_pnu_list.data.includes(found_pnu)) {
        found_pnu_list.data.push(found_pnu);
    }
    fs.writeFileSync(file_path, JSON.stringify(found_pnu_list, undefined, "  "));
};
var searchFoundPnu = function (pnu) {
    var file_path = shortcut_1.DATA_PATH + "land_number" + "/found_pnu_list.json";
    var found_pnu_list = JSON.parse(fs.readFileSync(file_path)) || {};
    if (found_pnu_list.date != (0, getDate_1.getDate)()) {
        return -1;
    }
    var _searchFoundPnuRecursively = function (pnu) {
        if (found_pnu_list.data.includes(pnu)) {
            return pnu;
        }
        else if (pnu.length == 7) {
            return -1;
        }
        else {
            return _searchFoundPnuRecursively(pnu.slice(0, -1));
        }
    };
    return _searchFoundPnuRecursively(pnu);
};
exports.searchFoundPnu = searchFoundPnu;
var handleFoundPnuAsync = function (pnu) {
    if (!pnu) {
        return Promise.resolve(null);
    }
    var found_pnu = (0, exports.searchFoundPnu)(pnu);
    if (typeof found_pnu !== "string") {
        return findPnuUnder100Async(pnu).then(function (new_pnu) {
            if (!new_pnu) {
                return null;
            }
            _updateFoundPnu(new_pnu);
            console.log("updated found pnu list.");
            return new_pnu;
        });
    }
    return Promise.resolve(found_pnu);
};
exports.handleFoundPnuAsync = handleFoundPnuAsync;
