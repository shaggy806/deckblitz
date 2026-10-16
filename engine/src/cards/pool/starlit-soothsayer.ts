import { defineCard } from "../define.js";

// EDHREC rank 11273.
//
// Rulings:
//   [2024-07-26] If you haven’t gained or lost life during the turn when your end step begins,
//     Starlit Soothsayer’s last ability won’t trigger at all. Gaining or losing life during your
//     end step won’t cause the ability to trigger.
//   [2024-07-26] Starlit Soothsayer’s last ability cares whether you gained or lost life this
//     turn, not how your life total changed. For example, if you gained 2 life and lost 2 life in
//     the same turn, you still gained and lost life that turn, even though your life total is the
//     same as it was at the start of the turn.
//
// "If you gained or lost life this turn" is an `any` of the two turn stats,
// an intervening if (rule 603.4).

const TEXT = "At the beginning of your end step, if you gained or lost life this turn, surveil 1.";

export default defineCard({
  name: "Starlit Soothsayer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "any",
        of: [
          { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
          { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 1 },
        ],
      },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
