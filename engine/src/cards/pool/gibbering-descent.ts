import { defineCard } from "../define.js";

// EDHREC rank 15909.
//
// Rulings:
//   [2007-05-01] If you have no cards in hand at the time your upkeep step would start, instead
//     that step is skipped and your draw step starts.
//   [2022-12-08] Madness rulings (rule 702.35).

const UPKEEP_TEXT = "At the beginning of each player's upkeep, that player loses 1 life and discards a card.";
const HELLBENT_TEXT = "Hellbent — Skip your upkeep step if you have no cards in hand.";

export default defineCard({
  name: "Gibbering Descent",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  madness: { cost: "{2}{B}{B}" },
  text: `${UPKEEP_TEXT}\n${HELLBENT_TEXT}\nMadness {2}{B}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  // Read as the upkeep step would begin (the ruling): a skipped one has no
  // "at the beginning of each player's upkeep" either.
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      skipsSteps: { who: "you", steps: ["upkeep"] },
      text: HELLBENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "active-player" },
          { kind: "discard", target: "active-player", amount: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
