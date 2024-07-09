/**
 * Calculates the standard deviation of an array of numbers.
 *
 * @param {number[]} values - An array of numbers to calculate the standard deviation for.
 * @return {number} The standard deviation of the input values.
 */
export function stdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    return Math.sqrt(avgSquaredDiff);
  }