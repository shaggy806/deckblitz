import { defineCard } from "../define.js";

// EDHREC rank 19838.
//
// Rulings:
//   [2024-04-12] The value of X is determined only once, as Rise of the Varmints resolves.

const MAIN_TEXT =
  "Create X 2/1 green Varmint creature tokens, where X is the number of creature cards in your graveyard.";

export default defineCard({
  name: "Rise of the Varmints",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  plot: { cost: "{2}{G}" },
  text: `${MAIN_TEXT}\nPlot {2}{G} (You may pay {2}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  effect: {
    kind: "create-token",
    token: "Varmint Token",
    count: { countInGraveyard: { type: "creature", ownedBy: "you" } },
  },
});
