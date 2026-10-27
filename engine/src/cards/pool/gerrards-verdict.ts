import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 26088.
//
// The land cards among the ones discarded, counted off this resolution (Psychic Miasma's
// `this-way` read, as an amount), three life each.

export default defineCard({
  name: "Gerrard's Verdict",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Target player discards two cards. You gain 3 life for each land card discarded this way.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      {
        kind: "gain-life",
        amount: { product: [3, { thisWay: "discarded", filter: { type: "land" } }] },
      },
    ],
  },
});
