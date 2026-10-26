import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 28807.

export default defineCard({
  name: "Rune Snag",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {2} plus an additional {2} for each card named Rune Snag in each graveyard.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [
      {
        payGeneric: { sum: [2, { product: [2, { countInGraveyard: { name: "Rune Snag" } }] }] },
        text: "Pay {2} plus {2} for each card named Rune Snag in each graveyard.",
      },
    ],
    otherwise: { kind: "counter", target: 0 },
  },
});
