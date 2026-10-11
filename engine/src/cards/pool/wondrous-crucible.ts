import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 4811.
//
// Rulings: the card stays exiled whatever happens to the copy; a copy not
// cast (no legal targets, or declined) ceases to exist; X is 0. Narset,
// Enlightened Exile's exile-then-copy shape, on a card picked at random as the
// trigger resolves (`choose-random-card`) rather than a target. "Permanents
// you control" includes the Crucible itself.

const WARD_TEXT = "Permanents you control have ward {2}.";
const END_STEP =
  "At the beginning of your end step, mill two cards, then exile a nonland card at random from your graveyard. Copy it. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Wondrous Crucible",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  text: `${WARD_TEXT}\n${END_STEP} (A copy of a permanent spell becomes a token.)`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you" } },
      grantsTriggered: [ward({ mana: "{2}" })],
      text: WARD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "choose-random-card",
            zone: "graveyard",
            filter: { notTypes: ["land"] },
            then: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: 0 },
                { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: END_STEP,
    },
  ],
});
