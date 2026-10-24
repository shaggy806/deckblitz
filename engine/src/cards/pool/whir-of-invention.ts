import { defineCard } from "../define.js";

export default defineCard({
  name: "Whir of Invention",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nSearch your library for an artifact card with mana value X or less, put it onto the battlefield, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "artifact", manaValue: { op: "lte", n: "x" } },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
