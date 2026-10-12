import { defineCard } from "../define.js";

export default defineCard({
  name: "Terramorph",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  rebound: true,
  text: "Search your library for a basic land card, put it onto the battlefield, then shuffle.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
