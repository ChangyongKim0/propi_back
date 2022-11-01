import { ErrorType, ObjectOf, HiddenObject } from "./globalTypes";
import { ErrorClass } from "./utils";
import { DATA_PATH } from "./shortcut";
import { getDate } from "./getDate";
const fs = require("fs");
import { getApiDataFromServer } from "./getApiDataFromServer";
// const findPnuUnder100Async = (pnu) => {
//   if (pnu.length == 8) {
//     return Promise.resolve(pnu);
//   }
//   return getApiDataFromServer("land_number", pnu.slice(0, -1)).then((data) => {
//     // console.log(data);
//     return Object.keys(data)[0] == "100"
//       ? Promise.resolve(pnu)
//       : new Promise((resolve) =>
//           setTimeout(() => {
//             resolve(findPnuUnder100Async(pnu.slice(0, -1)));
//           }, 0)
//         );
//   });
// };

const findPnuUnder100Async = (pnu: string): Promise<string> => {
  if (pnu.length == 11) {
    return Promise.resolve(pnu);
  }
  return getApiDataFromServer("land_number", pnu.slice(0, -1)).then((data) => {
    console.log(data);
    return Object.keys(data)[0] == "100"
      ? pnu
      : findPnuUnder100Async(pnu.slice(0, -1));
  });
};

const _updateFoundPnu = (found_pnu: string) => {
  const file_path = DATA_PATH + "land_number" + "/found_pnu_list.json";
  let found_pnu_list = JSON.parse(fs.readFileSync(file_path));
  if (found_pnu_list.date != getDate()) {
    found_pnu_list = { date: getDate(), data: [] };
  }
  if (!found_pnu_list.data.includes(found_pnu)) {
    found_pnu_list.data.push(found_pnu);
  }
  fs.writeFileSync(file_path, JSON.stringify(found_pnu_list, undefined, "  "));
};

export const searchFoundPnu = (pnu: string) => {
  const file_path = DATA_PATH + "land_number" + "/found_pnu_list.json";
  const found_pnu_list = JSON.parse(fs.readFileSync(file_path)) || {};
  if (found_pnu_list.date != getDate()) {
    return -1;
  }
  const _searchFoundPnuRecursively = (pnu: string): string | -1 => {
    if (found_pnu_list.data.includes(pnu)) {
      return pnu;
    } else if (pnu.length == 7) {
      return -1;
    } else {
      return _searchFoundPnuRecursively(pnu.slice(0, -1));
    }
  };
  return _searchFoundPnuRecursively(pnu);
};

export const handleFoundPnuAsync = (pnu: string): Promise<string | null> => {
  if (!pnu) {
    return Promise.resolve(null);
  }
  const found_pnu = searchFoundPnu(pnu);
  if (typeof found_pnu !== "string") {
    return findPnuUnder100Async(pnu).then((new_pnu) => {
      if (!new_pnu) {
        return null;
      }
      _updateFoundPnu(new_pnu);
      console.log("updated found pnu list.");
      return new_pnu;
    });
  }
  return Promise.resolve(found_pnu);
};
