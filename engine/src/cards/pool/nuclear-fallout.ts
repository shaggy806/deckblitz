import { defineCard } from "../define.js";

// EDHREC rank 3116.
//
// "Twice -X/-X" is -2X/-2X (The Meathook Massacre's shape, doubled).

export default defineCard({
  name: "Nuclear Fallout",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each creature gets twice -X/-X until end of turn. Each player gets X rad counters.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: { product: ["x", -2] },
        toughness: { product: ["x", -2] },
        duration: "end-of-turn",
      },
      { kind: "add-player-counters", counter: "rad", amount: "x", who: "each-player" },
    ],
  },
});
