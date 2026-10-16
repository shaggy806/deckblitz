import { defineCard } from "../define.js";

// EDHREC rank 9783.
const TEXT =
  'Draw three cards and create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Unfathomable Truths",
  manaCost: "{4}{U}",
  colors: [],
  types: ["instant"],
  text: `Devoid (This card has no color.)\n${TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
    ],
  },
});
