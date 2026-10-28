import { defineCard } from "../define.js";

// EDHREC rank 24289.

export default defineCard({
  name: "Splinter",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Exile target artifact. Search its controller's graveyard, hand, and library for all cards with the same name as that artifact and exile them. Then that player shuffles.",
  targets: ["artifact"],
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
