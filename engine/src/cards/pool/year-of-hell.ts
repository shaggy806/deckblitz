import { defineCard } from "../define.js";

const CHAPTER = "Each player draws a card. This Saga deals 2 damage to each player.";

export default defineCard({
  name: "Year of Hell",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI, II, III — ${CHAPTER}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, who: "each-player" },
          { kind: "damage", amount: 2, who: "each-player" },
        ],
      },
      resolve: null,
      text: `I, II, III — ${CHAPTER}`,
    },
  ],
});
