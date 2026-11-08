import { defineCard } from "../define.js";

// Devoid: colourless (`colors: []`). "Any number of cards": none has to be
// found, even in the graveyard (no `all` — Surgical Extraction's ruling).

export default defineCard({
  name: "Crumble to Dust",
  manaCost: "{3}{R}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nExile target nonbasic land. Search its controller's graveyard, hand, and library for any number of cards with the same name as that land and exile them. Then that player shuffles.",
  targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "search-library",
        whose: { controllerOf: 0 },
        zones: "graveyard-hand-library",
        filter: { sameNameWith: 0 },
        destination: "exile",
        min: 0,
        max: 99,
      },
    ],
  },
});
