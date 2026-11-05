import { defineCard } from "../define.js";

// EDHREC rank 6449.

export default defineCard({
  name: "Primal Growth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Kicker—Sacrifice a creature. (You may sacrifice a creature in addition to any other costs as you cast this spell.)\nSearch your library for a basic land card, put that card onto the battlefield, then shuffle. If this spell was kicked, instead search your library for up to two basic land cards, put them onto the battlefield, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
  kicker: {
    cost: "",
    also: { sacrifice: { filter: { type: "creature" }, count: 1 }, text: "Sacrifice a creature" },
    effect: {
      kind: "search-library",
      filter: { supertype: "basic", type: "land" },
      destination: "battlefield",
      min: 0,
      max: 2,
    },
  },
});
