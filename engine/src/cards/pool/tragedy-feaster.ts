import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 14137. Infusion here is no intervening-if: the ability always
// triggers and checks as it resolves (the ruling) — a `conditional` effect.

const INFUSION_TEXT =
  "Infusion — At the beginning of your end step, sacrifice a permanent unless you gained life this turn.";

export default defineCard({
  name: "Tragedy Feaster",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\nWard—Discard a card.\n${INFUSION_TEXT}`,
  triggered: [
    ward({ discard: 1 }),
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 } },
        then: { kind: "sacrifice", who: "you", filter: {}, count: 1 },
      },
      resolve: null,
      text: INFUSION_TEXT,
    },
  ],
});
