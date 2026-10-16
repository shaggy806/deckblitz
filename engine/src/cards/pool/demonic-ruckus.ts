import { defineCard } from "../define.js";

const STATIC_TEXT = "Enchanted creature gets +1/+1 and has menace and trample.";
const DRAW_TEXT = "When this Aura is put into a graveyard from the battlefield, draw a card.";

// Audacity's draw: only from the battlefield, so an Aura spell whose target
// has gone draws nothing (the ruling).
export default defineCard({
  name: "Demonic Ruckus",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  plot: { cost: "{R}" },
  text: `Enchant creature\n${STATIC_TEXT}\n${DRAW_TEXT}\nPlot {R} (You may pay {R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["menace", "trample"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
