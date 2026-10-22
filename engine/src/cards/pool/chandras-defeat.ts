import { defineCard } from "../define.js";

// EDHREC rank 22991. Take Out the Trash's rummage, offered only when the
// target is a Chandra planeswalker as the spell resolves.

export default defineCard({
  name: "Chandra's Defeat",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Chandra's Defeat deals 5 damage to target red creature or red planeswalker. If that permanent is a Chandra planeswalker, you may discard a card. If you do, draw a card.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"], colors: ["R"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "planeswalker", subtype: "Chandra" } },
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
