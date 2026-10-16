import { defineCard } from "../define.js";
import { valiant } from "../helpers.js";

// EDHREC rank 12574.
//
// Rulings:
//   [2024-07-26] If you create a copy of a spell on the stack and target a creature you control
//     with a valiant ability, that ability will trigger as long as the creature hasn't yet been
//     the target of a spell or ability you control this turn.
//   [2024-07-26] Valiant abilities will resolve before the spell or ability that caused them to
//     trigger.
//   [2024-07-26] If a spell or ability you control has one or more of its targets changed to a
//     creature you control with a valiant ability, that ability will trigger if that creature
//     hasn't yet been the target of a spell or ability you control this turn.

const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Whiskerquill Scribe",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mouse", "Citizen"],
  power: 2,
  toughness: 2,
  text: VALIANT_TEXT,
  triggered: [
    valiant(
      {
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
      VALIANT_TEXT,
    ),
  ],
});
