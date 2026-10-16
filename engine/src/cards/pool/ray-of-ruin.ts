import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. One target slot taking any of the three
// kinds; with it gone as the spell resolves, nothing happens, scry included
// (rule 608.2b).

export default defineCard({
  name: "Ray of Ruin",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature, Vehicle, or nonbasic land. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [
    {
      kind: "permanent",
      filter: {
        anyOf: [{ type: "creature" }, { subtype: "Vehicle" }, { type: "land", notSupertype: "basic" }],
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "scry", amount: 1 },
    ],
  },
});
