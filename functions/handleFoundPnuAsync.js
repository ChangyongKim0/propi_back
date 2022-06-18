const { DATA_PATH } = require("./shortcut");
const getDate = require("./getDate");
const fs = require("fs");
const getApiDataFromServer = require("./getApiDataFromServer");

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

const findPnuUnder100Async = (pnu) => {
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

const _updateFoundPnu = (found_pnu) => {
  const file_path = DATA_PATH + "land_number" + "/found_pnu_list.json";
  let found_pnu_list = JSON.parse(fs.readFileSync(file_path));
  if (found_pnu_list.date != getDate()) {
    found_pnu_list = { date: getDate(), data: [] };
  }
  if (!found_pnu_list.data.includes(found_pnu)) {
    found_pnu_list.data.push(found_pnu);
  }
  fs.writeFileSync(file_path, JSON.stringify(found_pnu_list, "", "  "));
};

const searchFoundPnu = (pnu) => {
  const file_path = DATA_PATH + "land_number" + "/found_pnu_list.json";
  const found_pnu_list = JSON.parse(fs.readFileSync(file_path)) || {};
  if (found_pnu_list.date != getDate()) {
    return -1;
  }
  const _searchFoundPnuRecursively = (pnu) => {
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

const handleFoundPnuAsync = (pnu) => {
  if (!pnu) {
    return Promise.resolve(null);
  }
  const found_pnu = searchFoundPnu(pnu);
  if (found_pnu == -1) {
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

exports.handleFoundPnuAsync = handleFoundPnuAsync;
exports.searchFoundPnu = searchFoundPnu;
