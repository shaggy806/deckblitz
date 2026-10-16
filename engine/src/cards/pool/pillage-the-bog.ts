import { defineCard } from "../define.js";

// EDHREC rank 9348.
//
// Rulings:
//   [2024-04-12] The value of X is determined only once, as Pillage the Bog resolves.
//   [2024-04-12] If you're casting a plotted card from exile without paying its mana cost, you
//     can't choose to cast it for any other alternative costs.
//
// "Twice the number of lands you control" is a `countOf` with `times: 2`, read
// once as the look happens.

const LOOK_TEXT =
  "Look at the top X cards of your library, where X is twice the number of lands you control. Put one of them into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Pillage the Bog",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  plot: { cost: "{1}{B}{G}" },
  text: `${LOOK_TEXT}\nPlot {1}{B}{G} (You may pay {1}{B}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { countOf: { type: "land", controlledBy: "you" }, times: 2 },
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-random",
  },
});
