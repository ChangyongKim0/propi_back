import { HiddenObject } from "./globalTypes";
import { CONFIG_PATH, DATA_PATH } from "./shortcut";
import { getDate } from "./getDate";
const fs = require("fs");
import { getApiDataFromServer } from "./getApiDataFromServer";
import { handleFoundPnuAsync, searchFoundPnu } from "./handleFoundPnuAsync";

const _updateApiData = (
  type: string,
  id: string | string[],
  id_to_get: string,
  is_pnu: boolean = true,
  file_save: boolean = true
): Promise<HiddenObject<string> | null> => {
  const file_path =
    DATA_PATH +
    type +
    "/" +
    (is_pnu ? id : (id as string[]).join("-")) +
    ".json";
  try {
    const file_data = JSON.parse(fs.readFileSync(file_path));
    if (file_data.date == getDate()) {
      return file_data.data[id_to_get];
    }
    // console.log(new_pnu);
  } catch {}
  return getApiDataFromServer(type, id, is_pnu)
    .then((data) => {
      if (file_save) {
        fs.writeFileSync(
          file_path,
          JSON.stringify({ date: getDate(), data: data }, undefined, "  ")
        );
        // console.log(getDate());
        console.log(
          "successfully write api data file of TYPE : " +
            type +
            "; ID : " +
            (is_pnu ? id : (id as string[]).join("-"))
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
          (is_pnu ? id : (id as string[]).join("-")) +
          "; IS_PNU : " +
          is_pnu
      );
      // console.log(err);
      return err;
    });
};

const _getApiDataEachWithFoundPnu = (
  type: string,
  new_pnu: string | null,
  id: string,
  file_save: boolean = true
): Promise<HiddenObject<string> | null> => {
  if (new_pnu === null) {
    return _updateApiData(type, id, id, true, file_save);
  }
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
  id_list: string[],
  previous_found_pnu_list: string[] = []
): Promise<string[] | null> => {
  // console.log(id_list);
  // console.log(previous_found_pnu_list);
  if (id_list.length == 0) {
    return Promise.resolve(previous_found_pnu_list);
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
    return handleFoundPnuAsync(id_list[0]).then((new_pnu) => {
      if (new_pnu !== null) {
        previous_found_pnu_list.push(new_pnu);
        return _handleMultipleFoundPnuAsync(
          id_list.slice(1),
          previous_found_pnu_list
        );
      }
      return null;
    });
  }
};

export const getApiData = (
  type: string | string[],
  id: string | string[],
  is_multiple: boolean = false,
  save_file: boolean = true
): Promise<HiddenObject<string> | null | (HiddenObject<string> | null)[]> => {
  if (is_multiple) {
    if (save_file) {
      _handleMultipleFoundPnuAsync(id as string[]).then((new_pnu_list) => {
        if (new_pnu_list === null) {
          return Promise.resolve(null);
        }
        return Promise.all(
          (type as string[]).map((e, idx) => {
            return _getApiDataEachWithFoundPnu(e, new_pnu_list[idx], id[idx]);
          })
        );
      });
    }

    const found_pnu_list = (id as string[]).map(searchFoundPnu);

    return Promise.all(
      (type as string[]).map((e, idx) => {
        return _getApiDataEachWithFoundPnu(
          e,
          found_pnu_list[idx] == -1
            ? (id as string[])[idx]
            : (found_pnu_list as string[])[idx],
          id[idx],
          false
        );
      })
    );
  } else {
    if (save_file) {
      handleFoundPnuAsync(id as string).then((new_pnu) => {
        return _getApiDataEachWithFoundPnu(
          type as string,
          new_pnu,
          id as string
        );
      });
    }

    const found_pnu = searchFoundPnu(id as string);
    return Promise.resolve(
      _getApiDataEachWithFoundPnu(
        type as string,
        found_pnu == -1 ? (id as string) : found_pnu,
        id as string,
        false
      )
    );
  }
};
