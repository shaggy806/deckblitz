import { defineCard } from "../define.js";

// EDHREC rank 14857. The cast limit reads the whole turn, including spells
// from before this was on the battlefield (its ruling).
export default defineCard({
  name: "Fires of Invention",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "You can cast spells only during your turn and you can cast no more than two spells each turn.\nYou may cast spells with mana value less than or equal to the number of lands you control without paying their mana costs.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "cast", who: "you", unless: "own-turn" },
        { act: "cast", who: "you", limit: 2 },
      ],
      text: "You can cast spells only during your turn and you can cast no more than two spells each turn.",
    },
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        filter: { manaValue: { op: "lte", n: { amount: { countOf: { type: "land", controlledBy: "you" } } } } },
      },
      text: "You may cast spells with mana value less than or equal to the number of lands you control without paying their mana costs.",
    },
  ],
});
