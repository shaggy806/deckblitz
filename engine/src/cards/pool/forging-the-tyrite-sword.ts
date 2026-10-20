import { defineCard } from "../define.js";

// EDHREC rank 8518.
// Makes Treasure → "Treasure Token".
const TREASURE_TEXT = "I, II — Create a Treasure token.";
const III_TEXT =
  "III — Search your library for a card named Halvar, God of Battle or an Equipment card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Forging the Tyrite Sword",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${TREASURE_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ name: "Halvar, God of Battle" }, { subtype: "Equipment" }] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
