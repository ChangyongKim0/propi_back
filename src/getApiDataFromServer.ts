import { ErrorClass, _stringfy } from "./utils";
import {
  HiddenObject,
  ObjectOf,
  PathList,
  Path,
  ConfigData,
  ErrorType,
} from "./globalTypes";
import { CONFIG_PATH, DATA_PATH } from "./shortcut";
import { requestApi } from "./requestApi";
const fs = require("fs");

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

const forceListType = (
  data: HiddenObject<string> | Array<HiddenObject<string>> | string
): Array<HiddenObject<string> | string> => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Object.keys(data).length == 0) {
    return [];
  }
  return [data];
};

const getDeepData = (
  data: HiddenObject<string> | string,
  path: Path,
  concatenate?: string
): HiddenObject<string> | string => {
  if (path.length == 0 || typeof data === "string") {
    return data;
  }
  if (concatenate != undefined) {
    return (path as string[][])
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
  const deep_data = data[path[0] as string];
  if (deep_data == undefined) {
    console.log("no data exists at the path : " + path[0]);
    return {};
  }
  return getDeepData(deep_data, path.slice(1));
};

export const getApiDataFromServer = (
  type: string,
  id: string | string[],
  is_pnu: boolean = true
): Promise<
  | ObjectOf<HiddenObject<string | Array<string>>>
  | ObjectOf<ObjectOf<HiddenObject<string>>>
> => {
  let data: ObjectOf<ObjectOf<Array<HiddenObject<string>>>> = {};
  let promise_list: Array<
    Promise<(string | HiddenObject<string>)[] | ErrorType>
  > = [];
  let id_path_list: PathList = [];
  let id_concatenate_list: (string | undefined)[] = [];
  let id_2_name_list: (string | undefined)[] = [];
  let id_2_path_list: (Path | undefined)[] = [];
  let id_2_concatenate_list: (string | undefined)[] = [];
  const config_data: ObjectOf<ConfigData> = JSON.parse(
    // fs.readFileSync(CONFIG_PATH + type + ".config_deprecated.json")
    fs.readFileSync(CONFIG_PATH + type + ".config.json")
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
        (is_pnu ? [id] : id) as string[],
        () => {},
        () => {},
        each_data.base_url.includes("nsdi.") ? 50 : 200
      )
        .then((res) => {
          console.log(each_data.illust + " responded.");
          return forceListType(getDeepData(res, each_data.path));
        })
        .catch((err: ErrorType) => {
          console.log(
            "getApiDataFromServer.js:getApiDataFromServer:requestApi"
          );
          console.log(err);
          return new ErrorClass(
            "알 수 없는 에러가 발생했어요(getApiDataFromServer)."
          );
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
      let id_list: string[] = [];
      res.map((e, idx) => {
        if (!(e instanceof ErrorClass)) {
          e.map((e2) => {
            const new_id = _stringfy(
              getDeepData(e2, id_path_list[idx], id_concatenate_list[idx])
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
              data[new_id][id_2_name_list[idx] as string].push({
                id: getDeepData(
                  e2,
                  id_2_path_list[idx] ?? [],
                  id_2_concatenate_list[idx]
                ) as HiddenObject<string>,
                ...(e2 as HiddenObject<string>),
              });
            } else {
              Object.assign(data[new_id], e2);
            }
          });
        }
      });
      return data;
    })
    .catch((err) => {
      console.log("getApiDataFromServer.js:getApiDataFromServer:Promise.all");
      console.log(err);
      return err;
    });
};
