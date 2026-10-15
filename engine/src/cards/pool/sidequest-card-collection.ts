import { defineCard } from "../define.js";

// EDHREC rank 18960.
//
// Sidequest: Raise a Chocobo's shape — an enchantment that transforms off a
// `step-begins` trigger with an intervening "if" (rule 603.4), checked as it
// triggers and again as it resolves (the ruling). The graveyard count is the
// controller's own, every card in it.
//
// Rulings:
//   [2025-06-06] Sidequest: Card Collection's last ability checks at the moment it would trigger
//     to see if you have eight or more cards in your graveyard. If you don't, the ability won't
//     trigger at all. If it does trigger, the ability will check again as it tries to resolve. If
//     there aren't eight or more cards in your graveyard at that time, the ability won't resolve
//     and none of its effects will happen.

const ETB_TEXT = "When this enchantment enters, draw three cards, then discard two cards.";
const END_TEXT =
  "At the beginning of your end step, if eight or more cards are in your graveyard, transform this enchantment.";

export default defineCard({
  name: "Sidequest: Card Collection",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "cards-in-graveyard", atLeast: 8 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Sidequest: Card Collection", "Magicked Card"],
  transform: true,
});
