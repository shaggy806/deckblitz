import { defineCard } from "../define.js";

// EDHREC rank 21103.

export default defineCard({
  name: "Spinewoods Paladin",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  plot: { cost: "{3}{G}" },
  text: "Trample\nWhen this creature enters, you gain 3 life.\nPlot {3}{G} (You may pay {3}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
  ],
});
