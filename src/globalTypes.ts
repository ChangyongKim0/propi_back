import { ErrorClass } from "./utils";

export type PathList = Path[];
export type Path = string[][] | string[];
export type ObjectOf<T> = {
  [key: string]: T;
};
export type HiddenObject<T> =
  | {
      [key: string]: HiddenObject<T>;
    }
  | ObjectOf<T>;
export declare class ErrorType extends ErrorClass {}

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

export type ConfigData = {
  illust: string;
  authkey_name: string;
  authkey: string;
  base_url: string;
  base_inputs: ObjectOf<string>;
  required_input_list: string[];
  path: string[];
  id_path: Path;
  id_concatenate?: string;
  id_2_name?: string;
  id_2_path?: Path;
  id_2_concatenate?: string;
  id_2_illust: string;
};
