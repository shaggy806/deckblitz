import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 13500.
//
// Storm counts every spell cast before it this turn, by any player, countered ones and ones cast
// from anywhere included; the copies aren't cast (the rulings).
export default defineCard({
  name: "Sprouting Vines",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Search your library for a basic land card, reveal that card, put it into your hand, then shuffle.\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm (When you cast this spell, copy it for each spell cast before it this turn.)",
    },
  ],
});
