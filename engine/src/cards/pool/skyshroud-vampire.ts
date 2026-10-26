import { defineCard } from "../define.js";

// EDHREC rank 31251.

const TEXT = "Discard a creature card: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Skyshroud Vampire",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
