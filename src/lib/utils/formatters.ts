export const getCurrency = (n: number, f: number = 2) => {
  if (!n) return 0;

  const options: Intl.NumberFormatOptions = {
    style: "decimal", // Other options: 'currency', 'percent', etc.
    minimumFractionDigits: f,
    maximumFractionDigits: f,
  };
  return n.toLocaleString("en-US", options);
};

export const getNumformat = (n: number) => {
  if (!n) return 0;

  const options: Intl.NumberFormatOptions = {
    style: "decimal", // Other options: 'currency', 'percent', etc.
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };
  return n.toLocaleString("en-US", options);
};
