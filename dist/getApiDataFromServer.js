"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.getApiDataFromServer = void 0;
var utils_1 = require("./utils");
var shortcut_1 = require("./shortcut");
var requestApi_1 = require("./requestApi");
var fs = require("fs");
// "br_jijigu_info": {
//     "illust": "건축물대장 지역지구구역",
//     "authkey_name": "serviceKey",
//     "authkey": "%2FCNGAvYj94QvhUym%2F%2FqKn%2BBaNw1qKU7Wrcfkn89kMQm4bKxoGtG%2FDeQkqZL6q%2B5JIaPjpYp8uhHBn4lJOusdUw%3D%3D",
//     "base_url": "http://apis.data.go.kr/1613000/BldRgstService_v2/getBrJijiguInfo",
//     "base_inputs": {
//       "numOfRows": "100000",
//       "pageNo": "1"
//     },
//     "required_input_list": ["sigunguCd", "bjdongCd", "platGbCd", "bun", "ji"],
//     "path": ["response", "body", "items", "item"],
//     "id_path": [["sigunguCd"], ["bjdongCd"], ["platGbCd"], ["bun"], ["ji"]],
//     "id_concatenate": "-",
//     "id_2_name": "bldg_district_list",
//     "id_2_path": [["mgmBldrgstPk"], ["reprYn"], ["jijiguGbCd"]],
//     "id_2_concatenate": "-",
//     "id_2_illust": "관리건축물대장-대표여부(1이 대표)-지역지구구분"
//   }
var forceListType = function (data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (Object.keys(data).length == 0) {
        return [];
    }
    return [data];
};
var getDeepData = function (data, path, concatenate) {
    if (path.length == 0 || typeof data === "string") {
        return data;
    }
    if (concatenate != undefined) {
        return path
            .map(function (each_path) {
            var each_deep_data = data[each_path[0]];
            if (each_deep_data == undefined) {
                console.log("no data exists at the path : " + path[0]);
                return "";
            }
            return getDeepData(each_deep_data, each_path.slice(1));
        })
            .join(concatenate);
    }
    var deep_data = data[path[0]];
    if (deep_data == undefined) {
        console.log("no data exists at the path : " + path[0]);
        return {};
    }
    return getDeepData(deep_data, path.slice(1));
};
var getApiDataFromServer = function (type, id, is_pnu) {
    if (is_pnu === void 0) { is_pnu = true; }
    var data = {};
    var promise_list = [];
    var id_path_list = [];
    var id_concatenate_list = [];
    var id_2_name_list = [];
    var id_2_path_list = [];
    var id_2_concatenate_list = [];
    var config_data = JSON.parse(fs.readFileSync(shortcut_1.CONFIG_PATH + type + ".config.json"));
    Object.keys(config_data).map(function (key) {
        var each_data = config_data[key];
        // console.log(
        //   "REQUESTED API :" + key + "; WITH ID : " + id + " AT TIME : " + Date.now()
        // );
        promise_list.push((0, requestApi_1.requestApi)(each_data.authkey_name, each_data.authkey, each_data.base_url, each_data.base_inputs, each_data.required_input_list, (is_pnu ? [id] : id))
            .then(function (res) {
            return forceListType(getDeepData(res, each_data.path));
        })["catch"](function (err) {
            console.log("getApiDataFromServer.js:getApiDataFromServer:requestApi");
            console.log(err);
            return new utils_1.ErrorClass("알 수 없는 에러가 발생했어요(getApiDataFromServer).");
        }));
        id_path_list.push(each_data.id_path);
        id_concatenate_list.push(each_data.id_concatenate);
        id_2_name_list.push(each_data.id_2_name);
        id_2_path_list.push(each_data.id_2_path);
        id_2_concatenate_list.push(each_data.id_2_concatenate);
    });
    return Promise.all(promise_list)
        .then(function (res) {
        var id_list = [];
        res.map(function (e, idx) {
            if (!(e instanceof utils_1.ErrorClass)) {
                e.map(function (e2) {
                    var _a;
                    var new_id = (0, utils_1._stringfy)(getDeepData(e2, id_path_list[idx], id_concatenate_list[idx]));
                    if (!id_list.includes(new_id)) {
                        data[new_id] = {};
                        id_2_name_list.map(function (id_2_name) {
                            if (id_2_name) {
                                data[new_id][id_2_name] = [];
                            }
                        });
                        id_list.push(new_id);
                    }
                    if (id_2_path_list[idx] != undefined) {
                        data[new_id][id_2_name_list[idx]].push(__assign({ id: getDeepData(e2, (_a = id_2_path_list[idx]) !== null && _a !== void 0 ? _a : [], id_2_concatenate_list[idx]) }, e2));
                    }
                    else {
                        Object.assign(data[new_id], e2);
                    }
                });
            }
        });
        return data;
    })["catch"](function (err) {
        console.log("getApiDataFromServer.js:getApiDataFromServer:Promise.all");
        console.log(err);
        return err;
    });
};
exports.getApiDataFromServer = getApiDataFromServer;
