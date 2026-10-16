import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 7607. Modern Horizons 3.
//
// The discard is mandatory for anyone holding a card, so "each opponent who
// can't" is each opponent who discarded nothing this way — Momentum Breaker's
// shape: one discard for every opponent (chosen and discarded together, the
// ruling), then a draw for you per opponent with none discarded.
//
// Rulings:
//   [2024-06-07] When Refurbished Familiar's last ability resolves, the next opponent in turn
//     order (or, if it's an opponent's turn, that opponent) chooses a card in hand without
//     revealing it, then each other opponent in turn order (if any) does the same. All chosen
//     cards are then discarded at the same time.

const ETB_TEXT =
  "When this creature enters, each opponent discards a card. For each opponent who can't, you draw a card.";

export default defineCard({
  name: "Refurbished Familiar",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Zombie", "Rat"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  selfCostReduction: affinity({ type: "artifact" }),
  text: `Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", who: "that-player", atMost: 0 },
              then: { kind: "draw", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
