import { defineCard } from "../define.js";

/** The land back face of Disciple of Freyalise — Emeria, Shattered Skyclave's shape. */
export default defineCard({
  name: "Garden of Freyalise",
  art: "https://cards.scryfall.io/art_crop/back/a/8/a8e9ea5a-5e10-4b77-baef-0352ff035483.jpg",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {G}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", mayPayLife: 3 },
      text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
  faces: ["Disciple of Freyalise", "Garden of Freyalise"],
});
