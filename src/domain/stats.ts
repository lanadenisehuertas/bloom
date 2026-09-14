/** Rolling average of `values`, one output per input, averaged over the trailing `windowSize` entries. */
export function rollingAverage(values: number[], windowSize: number): number[] {
  return values.map((_, i) => {
    const window = values.slice(Math.max(0, i - windowSize + 1), i + 1)
    return window.reduce((a, b) => a + b, 0) / window.length
  })
}
