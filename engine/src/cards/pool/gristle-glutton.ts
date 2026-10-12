import { defineCard } from "../define.js";

// Blight 1 as a cost (rule 701.68a): the creature is chosen as it's paid —
// this one included — and only while there is one (701.68b, never not here).
// "If you do" is the discard: an empty hand draws nothing.
export default defineCard({
  name: "Gristle Glutton",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 1,
  toughness: 3,
  text: "{T}, Blight 1: Discard a card. If you do, draw a card. (To blight 1, put a -1/-1 counter on a creature you control.)",
  activated: [
    {
      cost: { mana: null, tap: true, blight: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "{T}, Blight 1: Discard a card. If you do, draw a card.",
    },
  ],
});
