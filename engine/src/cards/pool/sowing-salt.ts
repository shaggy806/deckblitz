import { defineCard } from "../define.js";

// EDHREC rank 30674.

export default defineCard({
  name: "Sowing Salt",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile target nonbasic land. Search its controller's graveyard, hand, and library for all cards with the same name as that land and exile them. Then that player shuffles.",
  targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
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
