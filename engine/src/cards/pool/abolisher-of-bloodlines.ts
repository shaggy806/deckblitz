import { defineCard } from "../define.js";

// The back face of Voldaren Pariah. Diabolic Edict's `who: "target"`, three
// creatures: a player with fewer sacrifices what they have (the ruling).

const TRANSFORM_TEXT =
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
  text: `Flying\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: ["opponent"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 3 },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Voldaren Pariah", "Abolisher of Bloodlines"],
  transform: true,
});
