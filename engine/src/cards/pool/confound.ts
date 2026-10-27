import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 11908.
//
// Intervene's target, plus a card.

export default defineCard({
  name: "Confound",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell that targets a creature.\nDraw a card.",
  targets: [{ kind: "spell", filter: { targets: { permanent: { type: "creature" } } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
