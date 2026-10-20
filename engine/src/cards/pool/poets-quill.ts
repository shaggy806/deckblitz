import { defineCard } from "../define.js";

// EDHREC rank 17460.

export default defineCard({
  name: "Poet's Quill",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "When this Equipment enters, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)\nEquipped creature gets +1/+1 and has lifelink.\nEquip {1}{B}",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}{B}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Learn: discard a card to draw a card?",
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
      resolve: null,
      text: "When this Equipment enters, learn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: "Equipped creature gets +1/+1 and has lifelink.",
    },
  ],
});
