"use strict";
exports.__esModule = true;
exports.getApiData = void 0;
var shortcut_1 = require("./shortcut");
var getDate_1 = require("./getDate");
var fs = require("fs");
var getApiDataFromServer_1 = require("./getApiDataFromServer");
var handleFoundPnuAsync_1 = require("./handleFoundPnuAsync");
var _updateApiData = function (type, id, id_to_get, is_pnu, file_save) {
    if (is_pnu === void 0) { is_pnu = true; }
    if (file_save === void 0) { file_save = true; }
    var file_path = shortcut_1.DATA_PATH +
        type +
        "/" +
        (is_pnu ? id : id.join("-")) +
        ".json";
    try {
        var file_data = JSON.parse(fs.readFileSync(file_path));
        if (file_data.date == (0, getDate_1.getDate)()) {
            return file_data.data[id_to_get];
        }
        // console.log(new_pnu);
    }
    catch (_a) { }
    return (0, getApiDataFromServer_1.getApiDataFromServer)(type, id, is_pnu)
        .then(function (data) {
        if (file_save) {
            fs.writeFileSync(file_path, JSON.stringify({ date: (0, getDate_1.getDate)(), data: data }, undefined, "  "));
            // console.log(getDate());
            console.log("successfully write api data file of TYPE : " +
                type +
                "; ID : " +
                (is_pnu ? id : id.join("-")));
        }
        else {
            console.log("successfully get api data file of TYPE : " +
                type +
                "; ID : " +
                (is_pnu ? id : id.join("-")));
        }
        return data[id_to_get];
    })["catch"](function (err) {
        console.log("getApiData.js:_updateApiData");
        console.log("TYPE : " +
            type +
            "; ID : " +
            (is_pnu ? id : id.join("-")) +
            "; IS_PNU : " +
            is_pnu);
        // console.log(err);
        return err;
    });
};
var _getApiDataEachWithFoundPnu = function (type, new_pnu, id, file_save) {
    if (file_save === void 0) { file_save = true; }
    if (new_pnu === null) {
        return _updateApiData(type, id, id, true, file_save);
    }
    switch (type.split("_")[0]) {
        case "land":
            return _updateApiData(type, new_pnu, id, true, file_save);
        case "building":
            var new_id = [
                id.slice(0, 5),
                id.slice(5, 10),
                id[10] == "1" ? "0" : "1",
                new_pnu.length == 11 ? "" : id.slice(11, 15),
                new_pnu.length < 16 ? "" : id.slice(15),
            ];
            var new_id_to_get = [
                id.slice(0, 5),
                id.slice(5, 10),
                id[10] == "1" ? "0" : "1",
                id.slice(11, 15),
                id.slice(15),
            ].join("-");
            return _updateApiData(type, new_id, new_id_to_get, false, file_save);
        default:
            return _updateApiData(type, id, id, true, file_save);
    }
};
var _handleMultipleFoundPnuAsync = function (id_list, previous_found_pnu_list) {
    if (previous_found_pnu_list === void 0) { previous_found_pnu_list = []; }
    // console.log(id_list);
    // console.log(previous_found_pnu_list);
    if (id_list.length == 0) {
        return Promise.resolve(previous_found_pnu_list);
    }
    var index_that_id_is_included_in_previous_found_pnu_list = -1;
    previous_found_pnu_list.map(function (e, idx) {
        if (id_list[0].slice(0, e.length) == e) {
            index_that_id_is_included_in_previous_found_pnu_list = idx;
        }
    });
    if (index_that_id_is_included_in_previous_found_pnu_list != -1) {
        previous_found_pnu_list.push(previous_found_pnu_list[index_that_id_is_included_in_previous_found_pnu_list]);
        return _handleMultipleFoundPnuAsync(id_list.slice(1), previous_found_pnu_list);
    }
    else {
        return (0, handleFoundPnuAsync_1.handleFoundPnuAsync)(id_list[0]).then(function (new_pnu) {
            if (new_pnu !== null) {
                previous_found_pnu_list.push(new_pnu);
                return _handleMultipleFoundPnuAsync(id_list.slice(1), previous_found_pnu_list);
            }
            return null;
        });
    }
};
var getApiData = function (type, id, is_multiple, save_file) {
    if (is_multiple === void 0) { is_multiple = false; }
    if (save_file === void 0) { save_file = true; }
    if (is_multiple) {
        var found_pnu_list_1 = id.map(handleFoundPnuAsync_1.searchFoundPnu);
        return Promise.all(type.map(function (e, idx) {
            return _getApiDataEachWithFoundPnu(e, found_pnu_list_1[idx] == -1
                ? id[idx]
                : found_pnu_list_1[idx], id[idx], false);
        })).then(function (value) {
            if (save_file) {
                _handleMultipleFoundPnuAsync(id).then(function (new_pnu_list) {
                    if (new_pnu_list === null) {
                        return Promise.resolve(null);
                    }
                    return Promise.all(type.map(function (e, idx) {
                        return _getApiDataEachWithFoundPnu(e, new_pnu_list[idx], id[idx]);
                    }));
                });
            }
            return value;
        });
    }
    else {
        var found_pnu = (0, handleFoundPnuAsync_1.searchFoundPnu)(id);
        return Promise.resolve(_getApiDataEachWithFoundPnu(type, found_pnu == -1 ? id : found_pnu, id, false)).then(function (value) {
            if (save_file) {
                (0, handleFoundPnuAsync_1.handleFoundPnuAsync)(id).then(function (new_pnu) {
                    return _getApiDataEachWithFoundPnu(type, new_pnu, id);
                });
            }
            return value;
        });
    }
};
exports.getApiData = getApiData;
