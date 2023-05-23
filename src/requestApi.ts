import { ErrorClass } from "./utils";
import { ErrorType, HiddenObject, ObjectOf } from "./globalTypes";

var axios = require("axios");
var convert = require("xml-js");

let buffer_base_time: number = Date.now();
let request_id: number = 0;

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

const makeDelay = (ms: number): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
};

export const requestApi = (
  authkey_name: string,
  authkey: string,
  base_url: string,
  base_inputs: ObjectOf<string>,
  required_input_list: string[],
  input_list: string[],
  callBack = (response: any) => {},
  errorCallBack = (response: any) => {},
  use_buffer: number = 100
): Promise<HiddenObject<string>> => {
  var queryParams =
    "?" + encodeURIComponent(authkey_name) + "=" + authkey; /*Service Key*/

  required_input_list.map((e, idx) => {
    queryParams +=
      "&" + encodeURIComponent(e) + "=" + encodeURIComponent(input_list[idx]);
  });

  Object.keys(base_inputs).map((key) => {
    queryParams +=
      "&" +
      encodeURIComponent(key) +
      "=" +
      encodeURIComponent(base_inputs[key]); /**/
  });

  const removeJsonTextAttribute = function (
    value: string,
    parentElement: { _parent: ObjectOf<string[]> | ObjectOf<string> }
  ) {
    try {
      const parentOfParent = parentElement._parent;
      const pOpKeys = Object.keys(parentElement._parent);
      const keyNo = pOpKeys.length;
      const keyName = pOpKeys[keyNo - 1];
      const arrOfKey = parentElement._parent[keyName];
      const arrOfKeyLen = arrOfKey.length;
      if (arrOfKeyLen > 0) {
        const arr = arrOfKey as string[];
        const arrIndex = arrOfKey.length - 1;
        arr[arrIndex] = value;
      } else {
        parentElement._parent[keyName] = value;
      }
    } catch (e) {}
  };
  const headers = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  };

  const now: number = Date.now();
  const buffer_time: number =
    now > buffer_base_time ? 0 : buffer_base_time - now;
  const new_buffer_base_time = (buffer_base_time =
    now > buffer_base_time ? now + use_buffer : buffer_base_time + use_buffer);
  const new_id = (request_id += 1);

  const returnData = async (): Promise<HiddenObject<string>> => {
    const delay = await makeDelay(buffer_time);
    console.log(delay, new_buffer_base_time, Date.now());
    console.log(new_id + "-th request.");
    return axios
      .get(base_url + queryParams + (delay ? "" : ""), {
        headers,
      })
      .then((response: { status: number; data: string }) => {
        // console.log(base_url + queryParams);
        // console.log(response);
        // console.log(response.data.requestQueryString);
        let options = {
          compact: true,
          trim: true,
          nativeType: false,
          // ignoreDeclaration: true,
          // ignoreInstruction: true,
          // ignoreAttributes: true,
          // ignoreComment: true,
          // ignoreCdata: true,
          // ignoreDoctype: true,
          textFn: removeJsonTextAttribute,
        };
        if (response.status != 200) {
          errorCallBack(response);
        } else {
          let res = convert.xml2js(response.data, options);
          // console.log(res);
          callBack(res);
          console.log(new_id + "-th respond.");
          return res;
        }
      })
      .catch((error: unknown) => {
        // console.log(base_url + queryParams);
        // errorCallBack(error);
        console.log("requestApi.js:requestApi");
        // console.log(error);
        return new ErrorClass("공식 정보를 받아오지 못했어요.");
      });
  };

  return returnData();
};
