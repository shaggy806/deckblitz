import { defineCard } from "../define.js";

// EDHREC rank 8761.
//
// Rulings:
//   Counts the creatures attacking as it resolves, whoever controls them —
//   nothing before attackers are declared or after combat ends.

const TEXT = "Create X 1/1 white Bird Soldier creature tokens with flying, where X is the number of attacking creatures.";

export default defineCard({
  name: "Flurry of Wings",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "create-token",
    token: "Bird Soldier Token",
    count: { countOf: { type: "creature", attacking: true } },
  },
});
