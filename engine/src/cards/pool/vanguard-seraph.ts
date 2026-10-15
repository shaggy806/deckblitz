import { defineCard } from "../define.js";

// EDHREC rank 10701.
//
// Rulings:
//   [2024-11-08] If you gain life during a turn before Vanguard Seraph is on the battlefield, its
//     last ability won't trigger that turn even if you gain life again later in the turn.

const GAIN_TEXT = "Whenever you gain life for the first time each turn, surveil 1.";

export default defineCard({
  name: "Vanguard Seraph",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${GAIN_TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
