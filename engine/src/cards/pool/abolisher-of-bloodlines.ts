import { defineCard } from "../define.js";

const TEXT =
  "When this creature transforms into Abolisher of Bloodlines, target opponent sacrifices three creatures of their choice.";

export default defineCard({
  name: "Abolisher of Bloodlines",
  art: "https://cards.scryfall.io/art_crop/back/2/5/25baac6c-5bb4-4ecc-b1d5-fced52087bd9.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Vampire"],
  power: 6,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: ["opponent"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Voldaren Pariah", "Abolisher of Bloodlines"],
  transform: true,
});
