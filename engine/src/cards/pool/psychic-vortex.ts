import { defineCard } from "../define.js";

// EDHREC rank 15308. Cumulative upkeep (rule 702.24a) in the helper's shape,
// its cost drawing a card for each age counter: a `may` whose "if you don't"
// sacrifices it. Drawing is always payable — from an empty library too, the
// loss coming as a state-based action afterwards (the ruling) — and a draw a
// replacement changes still pays.
//
// Rulings:
//   [2008-04-01] You may choose to draw cards to pay the cumulative upkeep cost even if the number
//     of cards you'd have to draw exceeds the number of cards in your library.
//   [2008-04-01] Psychic Vortex's cumulative upkeep ability has you draw cards as a cost. If you
//     choose to do so, and some or all of those draws are replaced by replacement effects, you are
//     still considered to have paid the cumulative upkeep cost.

const UPKEEP_TEXT =
  "Cumulative upkeep—Draw a card. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const END_TEXT = "At the beginning of your end step, sacrifice a land and discard your hand.";

export default defineCard({
  name: "Psychic Vortex",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "may",
              prompt: "Draw a card for each age counter on Psychic Vortex? (If you don't, sacrifice it.)",
              effect: { kind: "draw", amount: { countersOn: "source", counter: "age" } },
              else: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
          { kind: "discard-hand", who: "you" },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
