import { defineCard } from "../define.js";

// EDHREC rank 24429.

export default defineCard({
  name: "Djinn of Fool's Fall",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  plot: { cost: "{3}{U}" },
  text: "Flying\nPlot {3}{U} (You may pay {3}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)",
});
