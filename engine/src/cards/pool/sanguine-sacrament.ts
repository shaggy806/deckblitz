import { defineCard } from "../define.js";

// EDHREC rank 12495.
//
// Rulings: twice X is gained as one life-gain event, so "whenever you gain
// life" triggers once.

export default defineCard({
  name: "Sanguine Sacrament",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain twice X life. Put Sanguine Sacrament on the bottom of its owner's library.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { product: ["x", 2] } },
      { kind: "put-on-library", target: "source", position: "bottom" },
    ],
  },
});
