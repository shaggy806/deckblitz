import { defineCard } from "../define.js";

// EDHREC rank 15067. Tweeze's rummage, offered only while you control a
// Raccoon as it resolves.
export default defineCard({
  name: "Take Out the Trash",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Take Out the Trash deals 3 damage to target creature or planeswalker. If you control a Raccoon, you may discard a card. If you do, draw a card.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Raccoon" }, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Discard a card to draw a card?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "discarded" },
                then: { kind: "draw", amount: 1 },
              },
            ],
          },
        },
      },
    ],
  },
});
