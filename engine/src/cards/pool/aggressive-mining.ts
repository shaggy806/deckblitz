import { defineCard } from "../define.js";

// EDHREC rank 8598.

export default defineCard({
  name: "Aggressive Mining",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "You can't play lands.\nSacrifice a land: Draw two cards. Activate only once each turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "Sacrifice a land: Draw two cards. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "you", lands: {} },
      text: "You can't play lands.",
    },
  ],
});
