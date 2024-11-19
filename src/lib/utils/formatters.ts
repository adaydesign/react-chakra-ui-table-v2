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

export function parseValueIntoString(value: any): string {
  if (value instanceof Date) {
    // If the value is a Date, convert it to a locale string
    return value.toLocaleString();
  } else if (Array.isArray(value)) {
    // If the value is an array, recursively parse each element and join with commas
    return value.map((element) => parseValueIntoString(element)).join(", ");
  } else if (value instanceof Object) {
    // If the value is an object, check for "default" property or parse its values
    return value.hasOwnProperty("default")
      ? value["default"] // Assume user set it to a string
      : parseValueIntoString(Object.values(value)[0]);
  }
  // If the value is neither Date, Object, nor Array, return it as-is
  return value;
}
