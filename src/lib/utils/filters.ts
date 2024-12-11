import { FilterFn, Row } from "@tanstack/react-table";

export const dateRangeFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: [Date, Date]
) => {
  const [startDate, endDate] = filterValue;
  const rowDate = new Date(row.getValue(columnId));

  if (!startDate && !endDate) return true; // If no range is selected, show all rows
  if (!endDate) return rowDate >= startDate; // Filter only with start date
  if (!startDate) return rowDate <= endDate; // Filter only with end date
  return rowDate >= startDate && rowDate <= endDate; // Filter with both
};

export const booleanFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: boolean
) => {
  const rowValue = row.getValue(columnId);
  return filterValue === rowValue;
};

export const enumFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: string
) => {
  const rowValue: string = row.getValue(columnId);
  return filterValue === rowValue;
};

export const multiEnumFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: string[]
) => {
  const rowValue: string = row.getValue(columnId);
  return filterValue.some((value) => rowValue === value);
};

export const arrayFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: string[]
) => {
  const rowValue: string[] = row.getValue(columnId);
  if (!rowValue || !rowValue.length) {
    return true;
  }

  return filterValue.some((filterItem) =>
    rowValue.some((value) => value === filterItem)
  );
};

export const stringFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: string
) => {
  // Split by whitespace and commas into individual words
  const rowValue = String(row.getValue(columnId))
    .toLowerCase()
    .split(/[\s,]+/);
  const filterTokens = filterValue.toLowerCase().split(/[\s,]+/);

  const requiredMatch = 0.74;
  const maxFailures =
    filterTokens.length - Math.ceil(filterTokens.length * requiredMatch);

  let failures = 0;

  for (const token of filterTokens) {
    if (!rowValue.some((word) => isFuzzyMatch(word, token))) {
      failures++;
      if (failures > maxFailures) {
        return false; // Early return if too many tokens fail
      }
    }
  }

  return true;
};

/**
 * Helper function to determine if a token is a fuzzy match within a text.
 */
function isFuzzyMatch(text: string, token: string): boolean {
  if (text.includes(token)) {
    return true;
  }

  // Allow minor typos
  return (
    getEditDistance(text, token) <= Math.max(1, Math.floor(token.length / 5))
  );
}

/**
 * Calculates the Levenshtein distance (edit distance) between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function getEditDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          1 +
          Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
      }
    }
  }

  return matrix[b.length][a.length];
}
