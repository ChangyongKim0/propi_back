"use strict";
exports.__esModule = true;
var bodyParser = require("body-parser");
var express = require("express");
var cors = require("cors");
var getApiData_1 = require("./getApiData");
var getAddress_1 = require("./getAddress");
var utils_1 = require("./utils");
var shortcut_1 = require("./shortcut");
var fs = require("fs");
var app = express();
// app.opts
// app.use(cors({
//     origins: ['https://api.propi.moohae.net', 'https://propi.moohae.net'],   // defaults to ['*']
//     credentials: true,                 // defaults to false
//     // headers: ['x-foo']                 // sets expose-headers
// }));
app.use(cors({
    origins: ["https://api.propi.moohae.net"]
}));
var port = 3100;
app.set("port", port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get("/", function (req, res) {
    // res.send("server testing ok");
    console.log("server testing ok");
});
app.get("/api/sample_dxf", function (req, res) {
    res.send(fs.readFileSync(shortcut_1.DATA_PATH + "sample.dxf"));
    console.log("data sent");
});
app.get("/api", function (req, res) {
    console.log("Hello World!");
    res.send("Hello Word!");
});
var support_type_list = ["land_data", "building_data", "law_restriction"];
support_type_list.map(function (type) {
    app.put("/api/" + type, function (req, res) {
        (0, getApiData_1.getApiData)(type, req.body.id, false, !(req.body.save_file == "false")).then(function (data) {
            console.log("successfull send api data TYPE : " + type + " ; ID : " + req.body.id);
            res.send(data);
        });
    });
});
var getMultipleApiData = function (type, id_list, prev_data, save_file) {
    if (prev_data === void 0) { prev_data = []; }
    if (id_list.length == 0) {
        return Promise.resolve(prev_data);
    }
    return (0, getApiData_1.getApiData)(type, id_list[0], false, save_file).then(function (data) {
        prev_data.push(data);
        return getMultipleApiData(type, id_list.slice(1), prev_data, save_file);
    });
};
// const getMultipleApiData = (type, id_list, prev_data = []) => {
//   return Promise.all(id_list.map((id) => getApiData(type, id)));
// };
support_type_list.map(function (type) {
    app.put("/api/" + type + "/list", function (req, res) {
        getMultipleApiData(type, req.body.id, [], !(req.body.save_file == "false")).then(function (data_list) {
            console.log("successfull send api data TYPE : " +
                type +
                "/list ; ID_NO : " +
                req.body.id.length);
            res.send(data_list);
        });
    });
});
// app.put("/api/land_data/list" + type, (req, res) => {
//   console.log("hello");
//   res.send([]);
// });
app.put("/api/multiple_data", function (req, res) {
    (0, getApiData_1.getApiData)(req.body.request_list.map(function (e) { return e.type; }), req.body.request_list.map(function (e) { return e.id; }), true).then(function (data) {
        req.body.request_list.map(function (e) {
            console.log("successfull send api data TYPE : " + e.type + " ; ID : " + e.id);
        });
        res.send(data);
    });
});
app.put("/api/address", function (req, res) {
    (0, getAddress_1.getAddress)(req.body.lat, req.body.lng).then(function (data) {
        if (data instanceof utils_1.ErrorClass) {
            res.send({ pnu: "00000000" });
        }
        else {
            res.send({ pnu: data });
        }
    });
});
app.listen(port, function () {
    console.log("Express listening on port", port);
});
