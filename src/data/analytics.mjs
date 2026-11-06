// the free analytics ids, read by src/layouts/Base.astro. these ids are public: they ship in every page's html.
// the loader only runs on the production host, so localhost and astro dev never report.

/**
 * @typedef {{ ga4Id: string, clarityId: string, productionHost: string }} Analytics
 */

/**
 * ga4Id is the google analytics 4 measurement id, clarityId the microsoft clarity project id, and productionHost the
 * only hostname allowed to load either tag.
 * @type {Analytics}
 */
export const analytics = {
  ga4Id: "G-V128XJDFGH",
  clarityId: "z9818tph8y",
  productionHost: "kennethyeaher.github.io",
};
