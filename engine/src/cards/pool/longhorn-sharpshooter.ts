import { defineCard } from "../define.js";

const PLOTTED_TEXT = "When this card becomes plotted, it deals 2 damage to any target.";

export default defineCard({
  name: "Longhorn Sharpshooter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  plot: { cost: "{3}{R}" },
  text: `Reach\n${PLOTTED_TEXT}\nPlot {3}{R} (You may pay {3}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "this-plotted" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: 2 },
      resolve: null,
      text: PLOTTED_TEXT,
    },
  ],
});
