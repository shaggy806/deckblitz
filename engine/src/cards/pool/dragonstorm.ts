import { defineCard } from "../define.js";

export default defineCard({
  name: "Dragonstorm",
  manaCost: "{8}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Search your library for a Dragon permanent card, put it onto the battlefield, then shuffle.\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
  effect: {
    kind: "search-library",
    filter: { subtype: "Dragon", notTypes: ["instant", "sorcery"] },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
