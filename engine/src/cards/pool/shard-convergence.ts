import { defineCard } from "../define.js";

export default defineCard({
  name: "Shard Convergence",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a Plains card, an Island card, a Swamp card, and a Mountain card. Reveal those cards, put them into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { subtypes: ["Plains", "Island", "Swamp", "Mountain"] },
    destination: "hand",
    min: 0,
    max: 4,
    reveal: true,
    together: {
      oneEach: [
        { label: "a Plains card", filter: { subtype: "Plains" } },
        { label: "an Island card", filter: { subtype: "Island" } },
        { label: "a Swamp card", filter: { subtype: "Swamp" } },
        { label: "a Mountain card", filter: { subtype: "Mountain" } },
      ],
    },
  },
});
