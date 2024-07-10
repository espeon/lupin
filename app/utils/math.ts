/**
 * Calculates the standard deviation of an array of numbers.
 *
 * @param {number[]} numbers - An array of numbers to calculate the standard deviation for.
 * @return {number} The standard deviation of the input values.
 */
export function stdDev(array: number[]): number {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}
