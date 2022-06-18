var bodyParser = require("body-parser");
var express = require("express");
var cors = require("cors");
var requestApi = require("./functions/requestApi");
const axios = require("axios");
const getApiData = require("./functions/getApiData");
const getAddress = require("./functions/getAddress");

var app = express();

// app.opts

// app.use(cors({
//     origins: ['https://api.propi.moohae.net', 'https://propi.moohae.net'],   // defaults to ['*']
//     credentials: true,                 // defaults to false
//     // headers: ['x-foo']                 // sets expose-headers
// }));

app.use(
  cors({
    origins: ["https://api.propi.moohae.net"],
  })
);

const port = 3100;
app.set("port", port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  // res.send("server testing ok");
  requestApi(
    "serviceKey",
    "%2FCNGAvYj94QvhUym%2F%2FqKn%2BBaNw1qKU7Wrcfkn89kMQm4bKxoGtG%2FDeQkqZL6q%2B5JIaPjpYp8uhHBn4lJOusdUw%3D%3D",
    "http://apis.data.go.kr/1611000/nsdi/LandCharacteristicsService/wfs/getLandCharacteristicsWFS",
    {
      typename: "F251",
      maxFeatures: "100",
      srsName: "EPSG:4326",
      resultType: "results",
    },
    ["pnu"],
    ["1111010100100900001"],
    (response) => {
      res.send(response);
    },
    (err) => {
      res.send(err);
    }
  );
  console.log("server testing ok");
});

app.get("/api", function (req, res) {
  console.log("Hello World!");
  res.send("Hello Word!");
});

const support_type_list = ["land_data", "building_data", "law_restriction"];

support_type_list.map((type) => {
  app.put("/api/" + type, (req, res) => {
    getApiData(type, req.body.id, false, !(req.body.save_file == "false")).then(
      (data) => {
        console.log(
          "successfull send api data TYPE : " + type + " ; ID : " + req.body.id
        );
        res.send(data);
      }
    );
  });
});

const getMultipleApiData = (type, id_list, prev_data = [], save_file) => {
  if (id_list.length == 0) {
    return Promise.resolve(prev_data);
  }
  return getApiData(type, id_list[0], false, save_file).then((data) => {
    prev_data.push(data);
    return getMultipleApiData(type, id_list.slice(1), prev_data, save_file);
  });
};

// const getMultipleApiData = (type, id_list, prev_data = []) => {
//   return Promise.all(id_list.map((id) => getApiData(type, id)));
// };

support_type_list.map((type) => {
  app.put("/api/" + type + "/list", (req, res) => {
    getMultipleApiData(
      type,
      req.body.id,
      [],
      !(req.body.save_file == "false")
    ).then((data_list) => {
      console.log(
        "successfull send api data TYPE : " +
          type +
          "/list ; ID_NO : " +
          req.body.id.length
      );
      res.send(data_list);
    });
  });
});

// app.put("/api/land_data/list" + type, (req, res) => {
//   console.log("hello");

//   res.send([]);
// });

app.put("/api/multiple_data", (req, res) => {
  getApiData(
    req.body.request_list.map((e) => e.type),
    req.body.request_list.map((e) => e.id),
    true
  ).then((data) => {
    req.body.request_list.map((e) => {
      console.log(
        "successfull send api data TYPE : " + e.type + " ; ID : " + e.id
      );
    });
    res.send(data);
  });
});

app.put("/api/address", (req, res) => {
  getAddress(req.body.lat, req.body.lng).then((data) => {
    res.send({ pnu: data });
  });
});

app.listen(port, () => {
  console.log("Express listening on port", port);
});
