import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). The hand is counted as the spell resolves,
// before its own draw.
export default defineCard({
  name: "Rending Vines",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Destroy target artifact or enchantment if its mana value is less than or equal to the number of cards in your hand.\nDraw a card.",
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: { manaValue: { op: "lte", n: { amount: { cardsInHand: "you" } } } },
        },
        then: { kind: "destroy", target: 0 },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
