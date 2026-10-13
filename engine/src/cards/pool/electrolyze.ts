import { defineCard } from "../define.js";

// EDHREC rank 7153.
//
// The split is chosen as it's cast, at least 1 to each target (the
// rulings): 2 to one target, or 1 to each of two. A target gone illegal
// keeps its share undealt, and the card is still drawn unless every target
// is illegal.

export default defineCard({
  name: "Electrolyze",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Electrolyze deals 2 damage divided as you choose among one or two targets.\nDraw a card.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
  divided: { total: 2, slot: 0 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-divided", from: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
