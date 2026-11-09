import { defineCard } from "../define.js";

// Rulings:
//   If you draw a card, and then this enters, you won't be able to draw more cards that turn.
//   A replacement effect that would try to replace a card you can't draw can't apply.
const TEXT = "Each player can't draw more than one card each turn.";

export default defineCard({
  name: "Spirit of the Labyrinth",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "draw", who: "each-player", perTurn: 1 }],
      text: TEXT,
    },
  ],
});
