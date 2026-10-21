import { defineCard } from "../define.js";

// EDHREC rank 2897.

export default defineCard({
  name: "Tooth and Nail",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• Search your library for up to two creature cards, reveal them, put them into your hand, then shuffle.\n• Put up to two creature cards from your hand onto the battlefield.\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Search your library for up to two creature cards, reveal them, put them into your hand, then shuffle.",
        effect: { kind: "search-library", filter: { type: "creature" }, destination: "hand", min: 0, max: 2, reveal: true },
      },
      {
        text: "Put up to two creature cards from your hand onto the battlefield.",
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: 2,
          destination: "battlefield",
          leftover: "stay",
          filter: { type: "creature" },
        },
      },
    ],
  },
});
