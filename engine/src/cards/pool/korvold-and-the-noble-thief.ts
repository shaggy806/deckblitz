import { defineCard } from "../define.js";

// EDHREC rank 12195.
// Makes Treasure → "Treasure Token".
//
// Rulings:
//   [2023-09-01] You pay all costs and follow all normal timing rules for a card played this way.

const TREASURE_TEXT =
  "I, II — Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";
const III_TEXT = "III — Exile the top three cards of target opponent's library. You may play those cards this turn.";

export default defineCard({
  name: "Korvold and the Noble Thief",
  manaCost: "{3}{R}",
  colors: ["R"],
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
      targets: ["opponent"],
      effect: { kind: "impulse-exile", amount: 3, duration: "end-of-turn", whose: 0 },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
