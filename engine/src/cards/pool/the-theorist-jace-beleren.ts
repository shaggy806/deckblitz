import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 7072.
//
// Rulings:
//   [2026-08-21] Your opponent will draw the card they normally draw in their draw step before you
//     draw a card from Jace's first ability.

const DRAW_TEXT = "At the beginning of each opponent's draw step, you draw a card.";
const PLUS_TEXT = "+1: Create a 1/1 blue Illusion creature token.";
const BOUNCE_TEXT =
  "−2: For each opponent, return up to one target artifact or creature that player controls to its owner's hand.";
const ULTIMATE_TEXT =
  "−6: Draw three cards. Then put X +1/+1 counters on each creature you control, where X is the number of cards in your hand.";

// "For each opponent … that player controls": one optional slot per opponent
// seat (Dismantling Wave's shape), each bound to that player — a target that
// has come under anyone else's control is illegal as it resolves. They're
// returned together.
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { typesAnyOf: ["artifact", "creature"] } },
});

export default defineCard({
  name: "The Theorist, Jace Beleren",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 3,
  text: `${DRAW_TEXT}\n${PLUS_TEXT}\n${BOUNCE_TEXT}\n${ULTIMATE_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Illusion Token", count: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
          { kind: "return-to-hand", target: 2 },
        ],
      },
      resolve: null,
      text: BOUNCE_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you" },
            counter: "+1/+1",
            amount: { cardsInHand: "you" },
          },
        ],
      },
      resolve: null,
      text: ULTIMATE_TEXT,
    },
  ],
  triggered: [
    {
      // The opponent's turn-based draw happens as the step begins, before
      // this trigger is put on the stack (the ruling).
      trigger: { on: "step-begins", step: "draw", who: "opponent" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
