// the webp candidates for an exhibit image come from the manifest scripts/build-exhibit-images.mjs writes, so every
// w descriptor is the copy's real width and no component carries a list of widths of its own.
import sizes from "@/data/exhibit-sizes.json";

const manifest: Record<string, number[]> = sizes;

/** the name the sized copies of an exhibit source use: its file name without the extension. */
export function exhibitName(src: string): string {
  return src.split("/").pop()!.replace(/\.[^.]+$/, "");
}

/** the srcset of webp copies for an exhibit source, widest last, each with its true width. */
export function exhibitSrcset(src: string): string {
  const name = exhibitName(src);
  const widths = manifest[name];
  if (!widths) throw new Error(`${src} has no sized copies; run scripts/build-exhibit-images.mjs`);
  return widths.map((width) => `/images/exhibits/sized/${name}-${width}.webp ${width}w`).join(", ");
}
