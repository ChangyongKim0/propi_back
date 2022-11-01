const fs = require("fs");
import { CONFIG_PATH, DATA_PATH } from "./shortcut";
import { getApiDataFromServer } from "./getApiDataFromServer";
import { handleFoundPnuAsync } from "./handleFoundPnuAsync";
import { ErrorClass } from "./utils";
import { fillZeros } from "./getDate";
import { ErrorType, ObjectOf, HiddenObject } from "./globalTypes";

const convertAddressToPnu = (ld_code: string, addr: string): string => {
  // console.log(ld_code, addr);
  let pnu = ld_code;
  pnu += addr[0] == "산" ? "2" : "1";
  const no = addr.replace(/[가-힣]/g, "");
  if (no.includes("-")) {
    pnu += fillZeros(no.split("-")[0], 4) + fillZeros(no.split("-")[1], 4);
  } else {
    pnu += fillZeros(no, 4) + "0000";
  }
  return pnu;
};

export const getAddress = (
  lat: string | number,
  lng: string | number
): Promise<string | ErrorType> => {
  return getApiDataFromServer("geocoder", [lng + "," + lat], false)
    .then((data) => {
      return convertAddressToPnu(
        (data as ObjectOf<ObjectOf<ObjectOf<string>>>)[""]["level4LC"][
          "_cdata"
        ],
        (data as ObjectOf<ObjectOf<ObjectOf<string>>>)[""]["level5"]["_cdata"]
      );
    })
    .catch((err) => {
      console.log("getAddress.js:getAddress");
      console.log("LAT : " + lat + "; LNG : " + lng);
      // console.log(err);
      return new ErrorClass("주소를 받아오지 못했어요.");
    });
};
