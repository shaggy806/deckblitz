import { defineCard } from "../define.js";

// EDHREC rank 27631.
//
// Rulings:
//   [2004-10-04] You can gain 2 or 4 life, but never 6.
//
// The intervening-if is "a black or red permanent"; the resolution reads
// "a black permanent and a red permanent" as two separate checks, so one
// black-and-red permanent satisfies both.

const TEXT =
  "At the beginning of your upkeep, if you control a black or red permanent, you gain 2 life. If you control a black permanent and a red permanent, you gain 4 life instead.";

const BLACK = { kind: "controls", filter: { colors: ["B"] }, atLeast: 1 } as const;
const RED = { kind: "controls", filter: { colors: ["R"] }, atLeast: 1 } as const;

export default defineCard({
  name: "Dega Sanctuary",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "any", of: [BLACK, RED] },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "all", of: [BLACK, RED] },
        then: { kind: "gain-life", amount: 4 },
        else: { kind: "gain-life", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
