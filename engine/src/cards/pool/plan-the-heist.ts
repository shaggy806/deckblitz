import { defineCard } from "../define.js";

// EDHREC rank 15105.
//
// Rulings:
//   [2024-04-12] You'll only surveil 3 if you have no cards in hand when Plan the Heist resolves,
//     but you'll still draw three cards either way.
//
// The hand is read as the spell resolves (it's on the stack by then, so it
// isn't in the hand it reads).

const MAIN_TEXT =
  "Surveil 3 if you have no cards in hand. Then draw three cards. (To surveil 3, look at the top three cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";

export default defineCard({
  name: "Plan the Heist",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  plot: { cost: "{3}{U}" },
  text: `${MAIN_TEXT}\nPlot {3}{U} (You may pay {3}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "hand-size", atMost: 0 },
        then: { kind: "surveil", amount: 3 },
      },
      { kind: "draw", amount: 3 },
    ],
  },
});
