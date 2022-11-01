export const fillZeros = (data: string, length: number): string => {
  if (data.length < length) {
    return fillZeros("0" + data, length);
  }
  return data;
};

export const getDate = (): string => {
  const now = new Date(Date.now());
  return (
    now.getFullYear().toString() +
    fillZeros((now.getMonth() + 1).toString(), 2) +
    fillZeros(now.getDate().toString(), 2)
  );
};
