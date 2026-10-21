import { defineCard } from "../define.js";

// EDHREC rank 9729. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] While resolving Fire Prophecy, you can't put more than one card on the bottom of
//     your library to draw more than one card.
//   [2020-04-17] If the target creature is an illegal target by the time Fire Prophecy tries to
//     resolve, the spell won't resolve. You won't have the option to put a card on the bottom of
//     your library.

// Manhole Missile's shape: the damage, then up to one card from hand to the
// bottom (none is the "you may" declined), and the draw only if one went.
export default defineCard({
  name: "Fire Prophecy",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fire Prophecy deals 3 damage to target creature. You may put a card from your hand on the bottom of your library. If you do, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: 3 },
      { kind: "look-and-choose", zone: "hand", min: 0, max: 1, destination: "library-bottom", leftover: "stay" },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-on-bottom" },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
