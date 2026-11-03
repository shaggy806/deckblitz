import { defineCard } from "../define.js";

const TEXT = "{T}: Look at the top three cards of target player's library.";

export default defineCard({
  name: "Orcish Spy",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "look-at-library-top", target: 0, count: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
