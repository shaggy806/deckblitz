import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] The card you reveal will be the card you draw, if applicable.
//   [2020-06-23] If you don't draw the card you reveal, it remains on top of your library.

export default defineCard({
  name: "Track Down",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Scry 3, then reveal the top card of your library. If it's a creature or land card, draw a card. (To scry 3, look at the top three cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: [],
  effect: {
    kind: "scry",
    amount: 3,
    then: {
      kind: "reveal-top",
      then: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { typesAnyOf: ["creature", "land"] } },
        then: { kind: "draw", amount: 1 },
      },
    },
  },
});
