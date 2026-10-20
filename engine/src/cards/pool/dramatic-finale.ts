import { defineCard } from "../define.js";

// EDHREC rank 13809.

const DIES_TEXT =
  "Whenever one or more nontoken creatures you control die, create a 2/1 white and black Inkling creature token with flying. This ability triggers only once each turn.";

export default defineCard({
  name: "Dramatic Finale",
  manaCost: "{W/B}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `Creature tokens you control get +1/+1.\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", tokenOnly: true },
      grantPt: [1, 1],
      text: "Creature tokens you control get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Inkling Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
