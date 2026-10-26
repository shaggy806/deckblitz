import { defineCard } from "../define.js";

const TEXT =
  "{3}, {T}, Sacrifice this artifact: Search your library for an Island card, a Swamp card, and a Mountain card. Reveal those cards, put them into your hand, then shuffle.";

export default defineCard({
  name: "Gem of Becoming",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: [],
      // Shard Convergence's shape: up to one of each, any of them may be left
      // unfound (the ruling).
      effect: {
        kind: "search-library",
        filter: { subtypes: ["Island", "Swamp", "Mountain"] },
        destination: "hand",
        min: 0,
        max: 3,
        reveal: true,
        together: {
          oneEach: [
            { label: "an Island card", filter: { subtype: "Island" } },
            { label: "a Swamp card", filter: { subtype: "Swamp" } },
            { label: "a Mountain card", filter: { subtype: "Mountain" } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
