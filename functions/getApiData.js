const { CONFIG_PATH, DATA_PATH } = require("./shortcut");
const getDate = require("./getDate");
const fs = require("fs");
const getApiDataFromServer = require("./getApiDataFromServer");
const handleFoundPnuAsync = require("./handleFoundPnuAsync");

const _updateApiData = (
  type,
  id,
  id_to_get,
  is_pnu = true,
  file_save = true
) => {
  if (!id) {
    return null;
  }
  const file_path =
    DATA_PATH + type + "/" + (is_pnu ? id : id.join("-")) + ".json";
  try {
    const file_data = JSON.parse(fs.readFileSync(file_path));
    if (file_data.date == getDate()) {
      return file_data.data[id_to_get];
    }
    // console.log(new_pnu);
  } catch {}
  return getApiDataFromServer(type, id, is_pnu)
    .then((data) => {
      // console.log(data);
      if (file_save) {
        fs.writeFileSync(
          file_path,
          JSON.stringify({ date: getDate(), data: data }, "", "  ")
        );
        // console.log(getDate());
        console.log(
          "successfully write api data file of TYPE : " +
            type +
            "; ID : " +
            (is_pnu ? id : id.join("-"))
        );
      }
      return data[id_to_get];
    })
    .catch((err) => {
      console.log("getApiData.js:_updateApiData");
      console.log(
        "TYPE : " +
          type +
          "; ID : " +
          (is_pnu ? id : id.join("-")) +
          "; IS_PNU : " +
          is_pnu
      );
      // console.log(err);
      return err;
    });
};

const _getApiDataEachWithFoundPnu = (type, new_pnu, id, file_save = true) => {
  switch (type.split("_")[0]) {
    case "land":
      return _updateApiData(type, new_pnu, id, true, file_save);
    case "building":
      const new_id = [
        id.slice(0, 5),
        id.slice(5, 10),
        id[10] == "1" ? "0" : "1",
        new_pnu.length == 11 ? "" : id.slice(11, 15),
        new_pnu.length < 16 ? "" : id.slice(15),
      ];
      const new_id_to_get = [
        id.slice(0, 5),
        id.slice(5, 10),
        id[10] == "1" ? "0" : "1",
        id.slice(11, 15),
        id.slice(15),
      ].join("-");
      return _updateApiData(type, new_id, new_id_to_get, false, file_save);
    default:
      return _updateApiData(type, id, id, true, file_save);
  }
};

const _handleMultipleFoundPnuAsync = (
  id_list,
  previous_found_pnu_list = []
) => {
  // console.log(id_list);
  // console.log(previous_found_pnu_list);
  if (id_list.length == 0) {
    return previous_found_pnu_list;
  }
  let index_that_id_is_included_in_previous_found_pnu_list = -1;
  previous_found_pnu_list.map((e, idx) => {
    if (id_list[0].slice(0, e.length) == e) {
      index_that_id_is_included_in_previous_found_pnu_list = idx;
    }
  });
  if (index_that_id_is_included_in_previous_found_pnu_list != -1) {
    previous_found_pnu_list.push(
      previous_found_pnu_list[
        index_that_id_is_included_in_previous_found_pnu_list
      ]
    );
    return _handleMultipleFoundPnuAsync(
      id_list.slice(1),
      previous_found_pnu_list
    );
  } else {
    return handleFoundPnuAsync
      .handleFoundPnuAsync(id_list[0])
      .then((new_pnu) => {
        // console.log(new_pnu);
        previous_found_pnu_list.push(new_pnu);
        return _handleMultipleFoundPnuAsync(
          id_list.slice(1),
          previous_found_pnu_list
        );
      });
  }
};

const getApiData = (type, id, is_multiple = false, save_file = true) => {
  if (is_multiple) {
    if (save_file) {
      _handleMultipleFoundPnuAsync(id).then((new_pnu_list) => {
        return Promise.all(
          type.map((e, idx) => {
            return _getApiDataEachWithFoundPnu(e, new_pnu_list[idx], id[idx]);
          })
        );
      });
    }

    const found_pnu_list = id.map(handleFoundPnuAsync.searchFoundPnu);

    return Promise.all(
      type.map((e, idx) => {
        return _getApiDataEachWithFoundPnu(
          e,
          found_pnu_list[idx] == -1 ? id[idx] : found_pnu_list[idx],
          id[idx],
          false
        );
      })
    );
  } else {
    if (save_file) {
      handleFoundPnuAsync.handleFoundPnuAsync(id).then((new_pnu) => {
        return _getApiDataEachWithFoundPnu(type, new_pnu, id);
      });
    }

    const found_pnu = handleFoundPnuAsync.searchFoundPnu(id);
    return Promise.resolve(
      _getApiDataEachWithFoundPnu(
        type,
        found_pnu == -1 ? id : found_pnu,
        id,
        false
      )
    );
  }
};

module.exports = getApiData;
