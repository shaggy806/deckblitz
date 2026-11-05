import { defineCard } from "../define.js";

// EDHREC rank 17842.

export default defineCard({
  name: "Stingerback Terror",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Scorpion", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  plot: { cost: "{2}{R}" },
  text: "Flying, trample\nThis creature gets -1/-1 for each card in your hand.\nPlot {2}{R} (You may pay {2}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, pt: [-1, -1] },
      text: "This creature gets -1/-1 for each card in your hand.",
    },
  ],
});
