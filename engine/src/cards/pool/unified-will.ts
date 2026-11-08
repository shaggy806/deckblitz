import { defineCard } from "../define.js";

// EDHREC rank 18676.
//
// Rulings:
//   [2010-06-15] Whether you control more creatures than the targeted spell’s controller is
//     checked only as Unified Will resolves. If that player controls more creatures than you at
//     this time, or you each control the same amount, Unified Will simply doesn’t do anything.

export default defineCard({
  name: "Unified Will",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell if you control more creatures than that spell's controller.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "player-compare", stat: { controls: { type: "creature" } }, compare: "more", than: { controllerOf: 0 } },
    then: { kind: "counter", target: 0 },
  },
});
