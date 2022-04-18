var bodyParser = require("body-parser");
var express = require("express");
var cors = require("cors");
const axios = require("axios");

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
  res.send("server testing ok");
  console.log("server testing ok");
});

app.get("/api", function (req, res) {
  console.log("Hello World!");
  res.send("Hello Word!");
});

app.listen(port, () => {
  console.log("Express listening on port", port);
});
