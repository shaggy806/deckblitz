import { defineCard } from "../define.js";

// An ability any player may activate (`anyPlayer`), and Mazemind Tome's
// "when there are N or more counters … if you do" state trigger: the
// targets are chosen as it triggers, and destroyed only if it was sacrificed.

const PLOT_TEXT = "{2}: Put a plot counter on this enchantment. Any player may activate this ability.";
const SAC_TEXT =
  "When there are five or more plot counters on this enchantment, sacrifice it. If you do, destroy up to two target creatures.";
const CREATURE = { kind: "optional", of: "creature" } as const;

export default defineCard({
  name: "Deadly Designs",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${PLOT_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "plot", amount: 1 },
      resolve: null,
      anyPlayer: true,
      text: PLOT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "plot", compare: { op: "gte", n: 5 } } },
      targets: [CREATURE, { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } }],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-source" },
            {
              kind: "sequence",
              simultaneous: true,
              effects: [
                { kind: "destroy", target: 0 },
                { kind: "destroy", target: 1 },
              ],
            },
          ],
        },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
