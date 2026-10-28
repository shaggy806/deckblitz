import { defineCard } from "../define.js";

const PROTECT_TEXT = "Protect — Whenever Cecil attacks, other attacking creatures gain indestructible until end of turn.";

export default defineCard({
  name: "Cecil, Redeemed Paladin",
  art: "https://cards.scryfall.io/art_crop/back/0/2/026e7167-d665-43d0-a51e-8df2d68cdb5e.jpg",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${PROTECT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true },
        keyword: "indestructible",
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: PROTECT_TEXT,
    },
  ],
  faces: ["Cecil, Dark Knight", "Cecil, Redeemed Paladin"],
  transform: true,
});
