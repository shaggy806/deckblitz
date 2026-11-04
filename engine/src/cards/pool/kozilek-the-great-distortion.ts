import { defineCard } from "../define.js";

// Oath of the Gatewatch (OGW). EDHREC rank 1564.
//
// The discard's X is announced as the ability's activated (rule 107.3a), so
// the target's filter and the cost's card both read it: `manaValueX`, one
// offer per X that has both a spell on the stack and a card in hand.
export default defineCard({
  name: "Kozilek, the Great Distortion",
  manaCost: "{8}{C}{C}",
  colors: [],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Eldrazi"],
  power: 12,
  toughness: 12,
  keywords: ["menace"],
  text: "When you cast this spell, if you have fewer than seven cards in hand, draw cards equal to the difference.\nMenace\nDiscard a card with mana value X: Counter target spell with mana value X.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "hand-size", atMost: 6 },
      targets: [],
      effect: { kind: "draw", amount: { difference: [7, { cardsInHand: "you" }] } },
      resolve: null,
      text: "When you cast this spell, if you have fewer than seven cards in hand, draw cards equal to the difference.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, manaValueX: true } },
      targets: [{ kind: "spell", filter: { manaValue: { op: "eq", n: "x" } } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "Discard a card with mana value X: Counter target spell with mana value X.",
    },
  ],
});
