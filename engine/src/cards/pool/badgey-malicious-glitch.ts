import { defineCard } from "../define.js";

// EDHREC rank 30827.

const TAPPED_TEXT = "Whenever Badgey becomes tapped, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Badgey, Malicious Glitch",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Illusion", "Horror"],
  power: 4,
  toughness: 3,
  text: TAPPED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
});
