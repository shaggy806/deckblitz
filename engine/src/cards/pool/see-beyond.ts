import { defineCard } from "../define.js";

export default defineCard({
  name: "See Beyond",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw two cards, then shuffle a card from your hand into your library.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      // Any card from the hand, then the library is shuffled; with an empty
      // hand nothing is shuffled (the rulings).
      {
        kind: "conditional",
        condition: { kind: "hand-size", atLeast: 1 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-top", leftover: "stay" },
            { kind: "shuffle-library" },
          ],
        },
      },
    ],
  },
});
