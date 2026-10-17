/**
 * home card devices, from the work grid (figma 428:2684): a browser for frontground (436:1883) and three phones
 * for the app cards (428:2686, 428:2698, 428:2704). screens are figma's exports, kept in each project's folder;
 * sohive's are the case study's own captures. phones are listed in figma's layer order (left, right, then the
 * centre phone on top), and a phone has a status bar or an island only where its figma frame draws one.
 *
 * @typedef {{ src: string, width: number, height: number }} DeviceScreen
 * @typedef {DeviceScreen & { slot: "left" | "right" | "center", statusBar?: true, island?: true }} DevicePhone
 * @typedef {{ kind: "browser", figma: string, address: string, screen: DeviceScreen }} BrowserCover
 * @typedef {{ kind: "phones", figma: string, phones: DevicePhone[] }} PhonesCover
 */

/** @type {Record<string, BrowserCover | PhonesCover>} */
export const coverDevices = {
  frontground: {
    kind: "browser",
    figma: "436:1883",
    address: "frontground · doctor",
    screen: { src: "/images/work/frontground/frontground-cover-doctor.png", width: 1919, height: 1079 },
  },
  terpcarehub: {
    kind: "phones",
    figma: "428:2686",
    phones: [
      { slot: "left", src: "/images/work/terpcarehub/terpcarehub-cover-home.png", width: 390, height: 1052, statusBar: true, island: true },
      // the wellness capture carries its own status bar, so figma draws no bar or island over it.
      { slot: "right", src: "/images/work/terpcarehub/terpcarehub-cover-wellness.png", width: 390, height: 844 },
      { slot: "center", src: "/images/work/terpcarehub/terpcarehub-cover-find-care.png", width: 390, height: 1340, statusBar: true, island: true },
    ],
  },
  sohive: {
    kind: "phones",
    figma: "428:2698",
    phones: [
      { slot: "left", src: "/images/work/sohive/sohive-event-screen.png", width: 658, height: 1423, island: true },
      { slot: "right", src: "/images/work/sohive/sohive-profile-screen.png", width: 658, height: 1423, island: true },
      { slot: "center", src: "/images/work/sohive/sohive-feed-screen.png", width: 658, height: 1423, island: true },
    ],
  },
  terpcare: {
    kind: "phones",
    figma: "428:2704",
    phones: [
      { slot: "left", src: "/images/work/terpcare/terpcare-cover-check-in.png", width: 430, height: 932, island: true },
      { slot: "right", src: "/images/work/terpcare/terpcare-cover-mood.png", width: 430, height: 932, island: true },
      { slot: "center", src: "/images/work/terpcare/terpcare-cover-home.png", width: 430, height: 932, island: true },
    ],
  },
};
