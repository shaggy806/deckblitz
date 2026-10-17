import { defineCard } from "../define.js";

// EDHREC rank 7555.
// Makes Treasure → use "Treasure Token".
// Makes Bird → use "2/2 Blue Bird Token".

export default defineCard({
  name: "Song of Eärendil",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Scry 2, then draw two cards.\nII — Create a Treasure token and a 2/2 blue Bird creature token with flying.\nIII — Put a flying counter on each creature you control without flying.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "scry", amount: 2, then: { kind: "draw", amount: 2 } },
      resolve: null,
      text: "I — Scry 2, then draw two cards.",
    },
    {
      at: [2],
      targets: [],
      // One instruction: the two tokens enter together.
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          { kind: "create-token", token: "2/2 Blue Bird Token", count: 1 },
        ],
      },
      resolve: null,
      text: "II — Create a Treasure token and a 2/2 blue Bird creature token with flying.",
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", notKeyword: "flying" },
        counter: "flying",
        amount: 1,
      },
      resolve: null,
      text: "III — Put a flying counter on each creature you control without flying.",
    },
  ],
});
