import { defineCard } from "../define.js";

// EDHREC rank 17765.
//
// Rulings:
//   [2026-01-27] If the target creature is an illegal target at the time Manhole Missile tries to
//     resolve, it won't resolve and none of its effects will happen. You won't get to put a card
//     from your hand on the bottom of your library, and you won't draw a card.


// The damage, then Valakut Awakening's hand-to-bottom choice of up to one
// card (none is "you may" declined), and the draw only if a card went. With
// the target illegal the spell doesn't resolve at all (the ruling).
export default defineCard({
  name: "Manhole Missile",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Manhole Missile deals 3 damage to target creature. You may put a card from your hand on the bottom of your library. If you do, draw a card.",
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
