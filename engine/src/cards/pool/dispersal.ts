import { defineCard } from "../define.js";

// The right half of Discovery // Dispersal.
//
// The ruling: each opponent in turn order from the active player (the next
// opponent, on your turn) chooses a nonland permanent they control whose mana
// value is the greatest among **all** their permanents (a transformed land can
// have one), knowing the choices before; all are returned at once. One who
// controls only lands returns nothing. Then each, in the same order, chooses a
// card face down and all are discarded at once (rule 101.4).
const FACES = ["Discovery // Dispersal", "Discovery", "Dispersal"];

export default defineCard({
  name: "Dispersal",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Each opponent returns a nonland permanent they control with the greatest mana value among permanents they control to its owner's hand, then discards a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: "each-opponent",
        for: {
          permanent: {
            notTypes: ["land"],
            controlledBy: "you",
            greatestAmongItsController: { of: "mana-value", among: {} },
          },
          own: true,
        },
      },
      { kind: "for-each-voted", which: "voted", simultaneous: true, effect: { kind: "return-to-hand", target: 0 } },
      { kind: "discard", target: "each-opponent", amount: 1 },
    ],
  },
  faces: FACES,
  split: true,
});
