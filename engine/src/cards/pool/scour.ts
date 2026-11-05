import { defineCard } from "../define.js";

// EDHREC rank 31791.

export default defineCard({
  name: "Scour",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target enchantment. Search its controller's graveyard, hand, and library for all cards with the same name as that enchantment and exile them. Then that player shuffles.",
  targets: ["enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
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
