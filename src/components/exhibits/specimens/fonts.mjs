// the faces the live specimens set, self-hosted and cut to the weights used by scripts/instance-fonts.py (latin only).
// a case study page declares only the faces its own specimens need, in its head (SpecimenFonts.astro), so no other
// page fetches or even names them.
export const specimenFaces = {
  inter: { family: "Inter", weight: "400 700", src: "/fonts/inter/inter-latin.woff2" },
  figtree: { family: "Figtree", weight: "400 700", src: "/fonts/figtree/figtree-latin.woff2" },
  // elms's own face, google's latin cuts of the two weights its send bar and model window set.
  lato: { family: "Lato", weight: "400", src: "/fonts/lato/lato-400-latin.woff2" },
  latoBold: { family: "Lato", weight: "700", src: "/fonts/lato/lato-700-latin.woff2" },
};

/** which faces each specimen kind sets. */
const specimenFonts = {
  "terpcare-mood": ["inter"],
  "terpcarehub-book": ["figtree"],
  "sohive-rsvp": ["inter"],
  "frontground-findings": ["figtree"],
  "frontground-greyscale": ["figtree"],
};

/** the faces a project's specimens need, once each, plus lato where elms's send bar or model window draws. */
export function fontsForProject(project) {
  const exhibits = project.exhibits ?? [];
  const kinds = exhibits.flatMap((exhibit) => (exhibit.specimens ?? []).map((specimen) => specimen.kind));
  const lato = exhibits.some((exhibit) => exhibit.sendBar || exhibit.toggle) ? ["lato", "latoBold"] : [];
  return [...new Set([...kinds.flatMap((kind) => specimenFonts[kind] ?? []), ...lato])];
}
