const { CONFIG_PATH, DATA_PATH } = require("./shortcut");
const requestApi = require("./requestApi");
const getDate = require("./getDate");
const fs = require("fs");

const forceListType = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Object.keys(data).length == 0) {
    return [];
  }
  return [data];
};

const getDeepData = (data, path, concatenate = undefined) => {
  if (path.length == 0) {
    return data;
  }
  if (concatenate != undefined) {
    return path
      .map((each_path) => {
        const each_deep_data = data[each_path[0]];
        if (each_deep_data == undefined) {
          console.log("no data exists at the path : " + path[0]);
          return "";
        }
        return getDeepData(each_deep_data, each_path.slice(1));
      })
      .join(concatenate);
  }
  const deep_data = data[path[0]];
  if (deep_data == undefined) {
    console.log("no data exists at the path : " + path[0]);
    return {};
  }
  return getDeepData(deep_data, path.slice(1));
};

const getApiDataFromServer = (type, id, is_pnu = true) => {
  let data = {};
  let promise_list = [];
  let id_path_list = [];
  let id_concatenate_list = [];
  let id_2_name_list = [];
  let id_2_path_list = [];
  let id_2_concatenate_list = [];
  const config_data = JSON.parse(
    fs.readFileSync(CONFIG_PATH + type + ".config_deprecated.json")
  );
  Object.keys(config_data).map((key) => {
    const each_data = config_data[key];
    // console.log(
    //   "REQUESTED API :" + key + "; WITH ID : " + id + " AT TIME : " + Date.now()
    // );
    promise_list.push(
      requestApi(
        each_data.authkey_name,
        each_data.authkey,
        each_data.base_url,
        each_data.base_inputs,
        each_data.required_input_list,
        is_pnu ? [id] : id
      )
        .then((res) => {
          return forceListType(getDeepData(res, each_data.path));
        })
        .catch((err) => {
          console.log(
            "getApiDataFromServer.js:getApiDataFromServer:requestApi"
          );
          console.log(err);
          return err;
        })
    );
    id_path_list.push(each_data.id_path);
    id_concatenate_list.push(each_data.id_concatenate);
    id_2_name_list.push(each_data.id_2_name);
    id_2_path_list.push(each_data.id_2_path);
    id_2_concatenate_list.push(each_data.id_2_concatenate);
  });

  return Promise.all(promise_list)
    .then((res) => {
      let id_list = [];
      res.map((e, idx) => {
        e.map((e2) => {
          const new_id = getDeepData(
            e2,
            id_path_list[idx],
            id_concatenate_list[idx]
          );
          if (!id_list.includes(new_id)) {
            data[new_id] = {};
            id_2_name_list.map((id_2_name) => {
              if (id_2_name) {
                data[new_id][id_2_name] = [];
              }
            });
            id_list.push(new_id);
          }
          if (id_2_path_list[idx] != undefined) {
            data[new_id][id_2_name_list[idx]].push({
              id: getDeepData(
                e2,
                id_2_path_list[idx],
                id_2_concatenate_list[idx]
              ),
              ...e2,
            });
          } else {
            Object.assign(data[new_id], e2);
          }
        });
      });
      return data;
    })
    .catch((err) => {
      console.log("getApiDataFromServer.js:getApiDataFromServer:Promise.all");
      console.log(err);
      return err;
    });
};

module.exports = getApiDataFromServer;
