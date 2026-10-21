import { defineCard } from "../define.js";

// EDHREC rank 7556.

export default defineCard({
  name: "The Birth of Meletis",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.\nII — Create a 0/4 colorless Wall artifact creature token with defender.\nIII — You gain 2 life.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtype: "Plains" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "I — Search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.",
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Wall Token (artifact, defender)", count: 1 },
      resolve: null,
      text: "II — Create a 0/4 colorless Wall artifact creature token with defender.",
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "III — You gain 2 life.",
    },
  ],
});
