"use strict";
exports.__esModule = true;
var axios = require("axios");
var convert = require("xml-js");
console.log("debug starts.");
var headers = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    Connection: "keep-alive",
    Host: "apis.data.go.kr",
    "Cache-Control": "max-age=0"
};
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
var requireUrl = function (url) {
    axios
        .get(url, {
        headers: headers
    })
        .then(function (response) {
        console.log(response);
        console.log(response.data);
        console.log(convert.xml2js(response.data, options));
    })["catch"](function (error) {
        console.log(error);
    });
};
// getApiDataFromServer(
//   "geocoder",
//   ["126.95836216684006,37.456067340082484"],
//   false
// ).then((data) => console.log(data));
// getAddress("37.456067340082484", "126.95836216684006").then((data) =>
//   console.log(data)
// );
// getApiData("building_data", "1168010300100120000").then((data) =>
//   console.log(data)
// );
requireUrl("http://apis.data.go.kr/1611000/nsdi/LandCharacteristicsService/wfs/getLandCharacteristicsWFS?serviceKey=%2FCNGAvYj94QvhUym%2F%2FqKn%2BBaNw1qKU7Wrcfkn89kMQm4bKxoGtG%2FDeQkqZL6q%2B5JIaPjpYp8uhHBn4lJOusdUw%3D%3D&typeName=F251&bbox=217970,447107,218515,447524,EPSG:5174&pnu=414501170010186&maxFeatures=10&srsName=EPSG:5174&resultType=results");
// fetch(
//   "http://apis.data.go.kr/1611000/nsdi/LandMoveService/attr/getLandMoveAttr?serviceKey=%2FCNGAvYj94QvhUym%2F%2FqKn%2BBaNw1qKU7Wrcfkn89kMQm4bKxoGtG%2FDeQkqZL6q%2B5JIaPjpYp8uhHBn4lJOusdUw%3D%3D&pnu=1111011000101260001&startDt=19480501&endDt=20115653&format=xml&numOfRows=10&pageNo=1"
// ).then((res) => console.log(res));
var notString = function (data) {
    return "";
};
setTimeout(function () { }, 10000000);
