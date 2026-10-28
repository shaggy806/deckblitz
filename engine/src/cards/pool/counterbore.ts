import { defineCard } from "../define.js";

// EDHREC rank 27068. Countered first, into its owner's graveyard, then found
// there by the search — the spell's controller's zones, not its owner's
// (the rulings). An uncounterable spell stays on the stack and the search
// still happens.

export default defineCard({
  name: "Counterbore",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Search its controller's graveyard, hand, and library for all cards with the same name as that spell and exile them. Then that player shuffles.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "search-library",
        whose: { controllerOfTarget: 0 },
        zones: "graveyard-hand-library",
        filter: { sameNameAsTarget: 0 },
        destination: "exile",
        all: true,
        min: 0,
        max: 99,
      },
    ],
  },
});
