// the webp candidates for an explore screen or thumbnail come from the manifest scripts/build-explore-images.mjs writes,
// so every w descriptor is the copy's real width.
import sizes from "@/data/explore-sizes.json";

const manifest: Record<string, number[]> = sizes;

/** the name the sized copies of an explore source use: its file name without the extension. */
export function exploreName(src: string): string {
  return src.split("/").pop()!.replace(/\.[^.]+$/, "");
}

/** the srcset of webp copies for an explore source, widest last, each with its true width. */
export function exploreSrcset(src: string): string {
  const name = exploreName(src);
  const widths = manifest[name];
  if (!widths) throw new Error(`${src} has no sized copies; run scripts/build-explore-images.mjs`);
  return widths.map((width) => `/images/explore/sized/${name}-${width}.webp ${width}w`).join(", ");
}
