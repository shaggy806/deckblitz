import { defineCard } from "../define.js";

// EDHREC rank 23728.

export default defineCard({
  name: "Manaforge Cinder",
  manaCost: "{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 1,
  toughness: 1,
  text: "{1}: Add {B} or {R}. Activate no more than three times each turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: "{1}: Add {B} or {R}. Activate no more than three times each turn.",
      timesEachTurn: 3,
    },
  ],
});
