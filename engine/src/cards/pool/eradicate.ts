import { defineCard } from "../define.js";

// EDHREC rank 24002.

export default defineCard({
  name: "Eradicate",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target nonblack creature. Search its controller's graveyard, hand, and library for all cards with the same name as that creature and exile them. Then that player shuffles.",
  targets: ["nonblack-creature"],
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
