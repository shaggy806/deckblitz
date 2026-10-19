import { defineCard } from "../define.js";

// Streets of New Capenna.

export default defineCard({
  name: "Ominous Parcel",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Sacrifice this artifact: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.\n{5}, {T}, Sacrifice this artifact: It deals 4 damage to target creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
    },
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 4 },
      resolve: null,
      text: "{5}, {T}, Sacrifice this artifact: It deals 4 damage to target creature.",
    },
  ],
});
