// the faces the live specimens set, self-hosted and cut to the weights used by scripts/instance-fonts.py (latin only).
// a case study page declares only the faces its own specimens need, in its head (SpecimenFonts.astro), so no other
// page fetches or even names them.
export const specimenFaces = {
  inter: { family: "Inter", weight: "500 700", src: "/fonts/inter/inter-latin.woff2" },
  figtree: { family: "Figtree", weight: "400 700", src: "/fonts/figtree/figtree-latin.woff2" },
};

/** which faces each specimen kind sets; the greyscale toggle is an image and sets none. */
const specimenFonts = {
  "terpcare-mood": ["inter"],
  "terpcarehub-book": ["figtree"],
  "sohive-rsvp": ["inter"],
  "frontground-findings": ["figtree"],
  "frontground-greyscale": [],
};

/** the faces a project's specimens need, once each. */
export function fontsForProject(project) {
  const kinds = (project.exhibits ?? []).flatMap((exhibit) => (exhibit.specimens ?? []).map((specimen) => specimen.kind));
  return [...new Set(kinds.flatMap((kind) => specimenFonts[kind] ?? []))];
}
