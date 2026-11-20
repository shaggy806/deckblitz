import { defineCard } from "../define.js";

// Mirage (MIR). Infernal Tutor's reveal and search, limited to a creature
// card. With none in hand the search still happens and finds nothing (an
// empty slot shares a name with nothing, rule 201.2a), then the library is
// shuffled: `thenAlways`. Finding a card is optional (the ruling).
const TEXT =
  "{4}, {T}: Reveal a creature card in your hand. Search your library for a card with the same name as that card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Assembly Hall",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "reveal",
        leftover: "stay",
        thenAlways: true,
        then: {
          kind: "search-library",
          filter: { sameNameWith: 0 },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
