"use strict";
exports.__esModule = true;
exports.requestApi = void 0;
var utils_1 = require("./utils");
var axios = require("axios");
var convert = require("xml-js");
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
var requestApi = function (authkey_name, authkey, base_url, base_inputs, required_input_list, input_list, callBack, errorCallBack) {
    if (callBack === void 0) { callBack = function (response) { }; }
    if (errorCallBack === void 0) { errorCallBack = function (response) { }; }
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
    return axios
        .get(base_url + queryParams, {
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
            return res;
        }
    })["catch"](function (error) {
        // console.log(base_url + queryParams);
        // errorCallBack(error);
        console.log("requestApi.js:requestApi");
        // console.log(error);
        return new utils_1.ErrorClass("공식 정보를 받아오지 못했어요.");
    });
};
exports.requestApi = requestApi;
