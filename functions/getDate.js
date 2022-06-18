const fillZeros = (data, length) => {
  if (data.length < length) {
    return fillZeros("0" + data, length);
  }
  return data;
};

const getDate = () => {
  const now = new Date(Date.now());
  return (
    now.getFullYear().toString() +
    fillZeros((now.getMonth() + 1).toString(), 2) +
    fillZeros(now.getDate().toString(), 2)
  );
};

module.exports = getDate;
