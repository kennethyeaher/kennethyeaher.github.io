/**
 * home card devices, from the work grid (figma 428:2684): a macbook (the Device/Laptop component 325:499) for elms
 * (528:12385) and frontground (528:12392), and three phones for the app cards (428:2698, 428:2704). screens
 * are figma's fills, kept in each project's folder; sohive's are the case study's own captures. a macbook's screen
 * covers the 16:9 screen from the top, so elms's 4:3 ready to send screen (the dc repaint of figma's core-1 fill) shows
 * its top three quarters, as figma crops it. phones are listed in figma's layer order (left, right, then the centre
 * phone on top), and a phone has an island only where its figma frame draws one. terpcarehub's phones moved into its
 * motion cover (src/data/coverMotion.mjs).
 *
 * @typedef {{ src: string, width: number, height: number }} DeviceScreen
 * @typedef {DeviceScreen & { slot: "left" | "right" | "center", island?: true }} DevicePhone
 * @typedef {{ kind: "macbook", figma: string, screen: DeviceScreen }} MacbookCover
 * @typedef {{ kind: "phones", figma: string, phones: DevicePhone[] }} PhonesCover
 */

/** @type {Record<string, MacbookCover | PhonesCover>} */
export const coverDevices = {
  "elms-redesign": {
    kind: "macbook",
    figma: "528:12385",
    screen: { src: "/images/work/elms-redesign/elms-cover-new-message.png", width: 1440, height: 1076 },
  },
  frontground: {
    kind: "macbook",
    figma: "528:12392",
    screen: { src: "/images/work/frontground/frontground-cover-doctor.png", width: 1919, height: 1079 },
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
