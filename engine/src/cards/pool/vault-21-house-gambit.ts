import { defineCard } from "../define.js";

// Makes Treasure → "Treasure Token".
//
// Chapter III counts only the revealed cards sharing a mana value with
// another revealed one: reveal 2, 2, 3 and two Treasures come; 2, 3, 4 makes
// none. "Up to five": the player may reveal fewer, or none.
const I_TEXT = "I, II — Discard a card, then draw a card.";
const III_TEXT =
  "III — Reveal up to five nonland cards from your hand. For each of those cards that has the same mana value as another card revealed this way, create a Treasure token.";

export default defineCard({
  name: "Vault 21: House Gambit",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 5,
            filter: { notTypes: ["land"] },
            destination: "reveal",
            leftover: "stay",
          },
          {
            kind: "create-token",
            token: "Treasure Token",
            count: { thisWay: "revealed", who: "you", sharingManaValue: true },
          },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
