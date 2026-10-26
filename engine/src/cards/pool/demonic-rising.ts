import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 25479.
//
// Rulings:
//   [2012-05-01] You must control exactly one creature both when the ability would trigger and
//     when it would resolve; it doesn't have to be the same one both times.
//
// "Exactly one" is at least one and not two: an intervening-if (rule 603.4),
// checked as it triggers and again as it resolves.

const TEXT =
  "At the beginning of your end step, if you control exactly one creature, create a 5/5 black Demon creature token with flying.";

export default defineCard({
  name: "Demonic Rising",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "controls", filter: { type: "creature" }, atLeast: 1 },
          { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 2 } },
        ],
      },
      targets: [],
      effect: { kind: "create-token", token: "5/5 Demon Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
