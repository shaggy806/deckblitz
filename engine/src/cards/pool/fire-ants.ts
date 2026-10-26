import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 16233.

const TEXT = "{T}: This creature deals 1 damage to each other creature without flying.";

export default defineCard({
  name: "Fire Ants",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", notKeyword: "flying" },
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
