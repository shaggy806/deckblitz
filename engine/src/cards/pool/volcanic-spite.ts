import { defineCard } from "../define.js";

// EDHREC rank 11385. March of the Machine.
//
// Manhole Missile's shape. With its target gone, it doesn't resolve at all —
// no card to the bottom, no draw (the ruling).

export default defineCard({
  name: "Volcanic Spite",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Volcanic Spite deals 3 damage to target creature, planeswalker, or battle. You may put a card from your hand on the bottom of your library. If you do, draw a card.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker", "battle"] } }],
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
