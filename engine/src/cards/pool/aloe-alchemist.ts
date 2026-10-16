import { defineCard } from "../define.js";

const PLOTTED_TEXT =
  "When this card becomes plotted, target creature gets +3/+2 and gains trample until end of turn.";

export default defineCard({
  name: "Aloe Alchemist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Warlock"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  plot: { cost: "{1}{G}" },
  text: `Trample\n${PLOTTED_TEXT}\nPlot {1}{G} (You may pay {1}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "this-plotted" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PLOTTED_TEXT,
    },
  ],
});
