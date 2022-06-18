const { CONFIG_PATH, DATA_PATH } = require("./shortcut");
const getDate = require("./getDate");
const fs = require("fs");
const getApiDataFromServer = require("./getApiDataFromServer");
const handleFoundPnuAsync = require("./handleFoundPnuAsync");

const fillZeros = (data, length) => {
  if (data.length < length) {
    return fillZeros("0" + data, length);
  }
  return data;
};

const convertAddressToPnu = (ld_code, addr) => {
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

const getAddress = (lat, lng) => {
  return getApiDataFromServer("geocoder", [lng + "," + lat], false)
    .then((data) => {
      return convertAddressToPnu(
        data["[object Object]"]["level4LC"]["_cdata"],
        data["[object Object]"]["level5"]["_cdata"]
      );
    })
    .catch((err) => {
      console.log("getAddress.js:getAddress");
      console.log("LAT : " + lat + "; LNG : " + lng);
      // console.log(err);
      return null;
    });
};

module.exports = getAddress;
