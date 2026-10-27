import { defineCard } from "../define.js";

export default defineCard({
  name: "Bifurcate",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a permanent card with the same name as target nontoken creature, put that card onto the battlefield, then shuffle.",
  targets: [{ kind: "permanent", filter: { type: "creature", token: false } }],
  effect: {
    kind: "search-library",
    filter: {
      typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
      sameNameAsTarget: 0,
    },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
