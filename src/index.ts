var bodyParser = require("body-parser");
var express = require("express");
var cors = require("cors");
import { requestApi } from "./requestApi";
import { getApiData } from "./getApiData";
import { getAddress } from "./getAddress";
import axios from "axios";
import { ErrorType } from "./globalTypes";
import { ErrorClass } from "./utils";
import { DATA_PATH } from "./shortcut";
const fs = require("fs");

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

app.get("/", (req: unknown, res: { send: (data: unknown) => unknown }) => {
  // res.send("server testing ok");
  console.log("server testing ok");
});

app.get(
  "/api/sample_dxf",
  (req: unknown, res: { send: (data: unknown) => unknown }) => {
    res.send(fs.readFileSync(DATA_PATH + "sample.dxf"));
    console.log("data sent");
  }
);

app.get(
  "/api",
  function (req: unknown, res: { send: (data: unknown) => unknown }) {
    console.log("Hello World!");
    res.send("Hello Word!");
  }
);

const support_type_list = ["land_data", "building_data", "law_restriction"];

support_type_list.map((type) => {
  app.put(
    "/api/" + type,
    (
      req: { body: { id: string; save_file: string } },
      res: { send: (data: unknown) => unknown }
    ) => {
      getApiData(
        type,
        req.body.id,
        false,
        !(req.body.save_file == "false")
      ).then((data: unknown) => {
        console.log(
          "successfull send api data TYPE : " + type + " ; ID : " + req.body.id
        );
        res.send(data);
      });
    }
  );
});

const getMultipleApiData = (
  type: string,
  id_list: string[],
  prev_data: unknown[] = [],
  save_file: boolean
): Promise<unknown[]> => {
  if (id_list.length == 0) {
    return Promise.resolve(prev_data);
  }
  return getApiData(type, id_list[0], false, save_file).then(
    (data: unknown) => {
      prev_data.push(data);
      return getMultipleApiData(type, id_list.slice(1), prev_data, save_file);
    }
  );
};

// const getMultipleApiData = (type, id_list, prev_data = []) => {
//   return Promise.all(id_list.map((id) => getApiData(type, id)));
// };

support_type_list.map((type) => {
  app.put(
    "/api/" + type + "/list",
    (
      req: { body: { id: string[]; save_file: string } },
      res: { send: (data: unknown) => unknown }
    ) => {
      getMultipleApiData(
        type,
        req.body.id,
        [],
        !(req.body.save_file == "false")
      ).then((data_list: unknown[]) => {
        console.log(
          "successfull send api data TYPE : " +
            type +
            "/list ; ID_NO : " +
            req.body.id.length
        );
        res.send(data_list);
      });
    }
  );
});

// app.put("/api/land_data/list" + type, (req, res) => {
//   console.log("hello");

//   res.send([]);
// });

app.put(
  "/api/multiple_data",
  (
    req: { body: { request_list: { type: string; id: string }[] } },
    res: { send: (data: unknown) => unknown }
  ) => {
    getApiData(
      req.body.request_list.map((e) => e.type),
      req.body.request_list.map((e) => e.id),
      true
    ).then((data: unknown) => {
      req.body.request_list.map((e) => {
        console.log(
          "successfull send api data TYPE : " + e.type + " ; ID : " + e.id
        );
      });
      res.send(data);
    });
  }
);

app.put(
  "/api/address",
  (
    req: { body: { lat: string; lng: string } },
    res: { send: (data: unknown) => unknown }
  ) => {
    getAddress(req.body.lat, req.body.lng).then((data: string | ErrorType) => {
      if (data instanceof ErrorClass) {
        res.send({ pnu: "00000000" });
      } else {
        res.send({ pnu: data });
      }
    });
  }
);

app.listen(port, () => {
  console.log("Express listening on port", port);
});
