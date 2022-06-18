var axios = require("axios");
var convert = require("xml-js");

const requestApi = (
  authkey_name,
  authkey,
  base_url,
  base_inputs,
  required_input_list,
  input_list,
  callBack = () => {},
  errorCallBack = () => {}
) => {
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

  const removeJsonTextAttribute = function (value, parentElement) {
    try {
      const parentOfParent = parentElement._parent;
      const pOpKeys = Object.keys(parentElement._parent);
      const keyNo = pOpKeys.length;
      const keyName = pOpKeys[keyNo - 1];
      const arrOfKey = parentElement._parent[keyName];
      const arrOfKeyLen = arrOfKey.length;
      if (arrOfKeyLen > 0) {
        const arr = arrOfKey;
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

  return axios
    .get(base_url + queryParams, {
      headers,
    })
    .then((response) => {
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
        return res;
      }
    })
    .catch((error) => {
      // console.log(base_url + queryParams);
      // errorCallBack(error);
      console.log("requestApi.js:requestApi");
      // console.log(error);
      return error;
    });
};

module.exports = requestApi;
