import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// When the last time counter comes off, this and vanishing's sacrifice
// trigger together: resolving this one first exiles it ("when you do", an
// extra turn); resolving the sacrifice first leaves nothing to exile.
const REMOVED_TEXT =
  "Whenever one or more time counters are removed from this enchantment, scry 1 and you gain 1 life. Then if this enchantment has no time counters on it, exile it. When you do, take an extra turn after this one.";

export default defineCard({
  name: "Regenerations Restored",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `Vanishing 12 (This enchantment enters with twelve time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n${REMOVED_TEXT}`,
  static: [...vanishing(12).static],
  triggered: [
    ...vanishing(12).triggered,
    {
      trigger: { on: "counters-removed", who: "self", counter: "time" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "gain-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "time", compare: { op: "eq", n: 0 } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: "source" },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "exiled" },
                  then: {
                    kind: "reflexive-trigger",
                    targets: [],
                    effect: { kind: "take-extra-turn" },
                    text: "When you do, take an extra turn after this one.",
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: REMOVED_TEXT,
    },
  ],
});
