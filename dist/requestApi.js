"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.requestApi = void 0;
var utils_1 = require("./utils");
var axios = require("axios");
var convert = require("xml-js");
var buffer_base_time = Date.now();
var request_id = 0;
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
var makeDelay = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(ms);
        }, ms);
    });
};
var requestApi = function (authkey_name, authkey, base_url, base_inputs, required_input_list, input_list, callBack, errorCallBack, use_buffer) {
    if (callBack === void 0) { callBack = function (response) { }; }
    if (errorCallBack === void 0) { errorCallBack = function (response) { }; }
    if (use_buffer === void 0) { use_buffer = 100; }
    var queryParams = "?" + encodeURIComponent(authkey_name) + "=" + authkey; /*Service Key*/
    required_input_list.map(function (e, idx) {
        queryParams +=
            "&" + encodeURIComponent(e) + "=" + encodeURIComponent(input_list[idx]);
    });
    Object.keys(base_inputs).map(function (key) {
        queryParams +=
            "&" +
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(base_inputs[key]); /**/
    });
    var removeJsonTextAttribute = function (value, parentElement) {
        try {
            var parentOfParent = parentElement._parent;
            var pOpKeys = Object.keys(parentElement._parent);
            var keyNo = pOpKeys.length;
            var keyName = pOpKeys[keyNo - 1];
            var arrOfKey = parentElement._parent[keyName];
            var arrOfKeyLen = arrOfKey.length;
            if (arrOfKeyLen > 0) {
                var arr = arrOfKey;
                var arrIndex = arrOfKey.length - 1;
                arr[arrIndex] = value;
            }
            else {
                parentElement._parent[keyName] = value;
            }
        }
        catch (e) { }
    };
    var headers = {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
    };
    var now = Date.now();
    var buffer_time = now > buffer_base_time ? 0 : buffer_base_time - now;
    var new_buffer_base_time = (buffer_base_time =
        now > buffer_base_time ? now + use_buffer : buffer_base_time + use_buffer);
    var new_id = (request_id += 1);
    var returnData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var delay;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeDelay(buffer_time)];
                case 1:
                    delay = _a.sent();
                    console.log(delay, new_buffer_base_time, Date.now());
                    console.log(new_id + "-th request.");
                    return [2 /*return*/, axios
                            .get(base_url + queryParams + (delay ? "" : ""), {
                            headers: headers
                        })
                            .then(function (response) {
                            // console.log(base_url + queryParams);
                            // console.log(response);
                            // console.log(response.data.requestQueryString);
                            var options = {
                                compact: true,
                                trim: true,
                                nativeType: false,
                                // ignoreDeclaration: true,
                                // ignoreInstruction: true,
                                // ignoreAttributes: true,
                                // ignoreComment: true,
                                // ignoreCdata: true,
                                // ignoreDoctype: true,
                                textFn: removeJsonTextAttribute
                            };
                            if (response.status != 200) {
                                errorCallBack(response);
                            }
                            else {
                                var res = convert.xml2js(response.data, options);
                                // console.log(res);
                                callBack(res);
                                console.log(new_id + "-th respond.");
                                return res;
                            }
                        })["catch"](function (error) {
                            // console.log(base_url + queryParams);
                            // errorCallBack(error);
                            console.log("requestApi.js:requestApi");
                            // console.log(error);
                            return new utils_1.ErrorClass("공식 정보를 받아오지 못했어요.");
                        })];
            }
        });
    }); };
    return returnData();
};
exports.requestApi = requestApi;
