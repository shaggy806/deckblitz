import { defineCard } from "../define.js";

// "You may pay {1}{R} and discard a card": the target is chosen as the trigger
// goes on the stack, the payment and the discard as it resolves (its ruling).
// A cost that discards a card can't be paid from an empty hand, so the offer
// is made only with a card in hand; the damage is the discarded card's mana
// value (an {X} in it counts as 0).

export default defineCard({
  name: "Wolf of Devil's Breach",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Wolf"],
  power: 5,
  toughness: 5,
  text: "Whenever this creature attacks, you may pay {1}{R} and discard a card. If you do, this creature deals damage to target creature or planeswalker equal to the discarded card's mana value.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Pay {1}{R} and discard a card?",
          cost: "{1}{R}",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              { kind: "damage", amount: { thisWay: "discarded", sumOf: "mana-value" }, target: 0 },
            ],
          },
        },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may pay {1}{R} and discard a card. If you do, this creature deals damage to target creature or planeswalker equal to the discarded card's mana value.",
    },
  ],
});
