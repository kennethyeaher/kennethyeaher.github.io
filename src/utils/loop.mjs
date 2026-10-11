/** the id a loop's video carries, so the control in its media tag can name it in aria-controls. */
export function loopId(loopName) {
  return `clip-${loopName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
