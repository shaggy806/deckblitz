import { defineCard } from "../define.js";

// EDHREC rank 10512.
//
// Rulings:
//   [2024-07-26] If you haven’t gained or lost life during the turn when your end step begins,
//     Star Charter’s last ability won’t trigger at all. Gaining or losing life during your end
//     step won’t cause the ability to trigger.
//   [2024-07-26] Star Charter’s last ability cares whether you gained or lost life this turn, not
//     how your life total changed. For example, if you gained 2 life and lost 2 life in the same
//     turn, you still gained and lost life that turn, even though your life total is the same as
//     it was at the start of the turn.
//
// "If you gained or lost life this turn" is an `any` of the two turn stats,
// an intervening if (rule 603.4). The look is Squad Rallier's.

const TEXT =
  "At the beginning of your end step, if you gained or lost life this turn, look at the top four cards of your library. You may reveal a creature card with power 3 or less from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Star Charter",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bat", "Cleric"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", power: { op: "lte", n: 3 } },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
