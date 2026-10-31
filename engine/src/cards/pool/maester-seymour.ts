import { defineCard } from "../define.js";

// Rulings:
//   [2025-06-06] The value of X is determined only once, as Maester Seymour's last ability
//     resolves.
//   [2025-06-06] If Maester Seymour is no longer on the battlefield when its first ability
//     resolves, use its power as it last existed on the battlefield.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, put a number of +1/+1 counters equal to Maester Seymour's power on another target creature you control.";
const MONSTROSITY_TEXT =
  "{3}{G}{G}: Monstrosity X, where X is the number of counters among creatures you control.";

export default defineCard({
  name: "Maester Seymour",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${COMBAT_TEXT}\n${MONSTROSITY_TEXT} (If this creature isn't monstrous, put X +1/+1 counters on it and it becomes monstrous.)`,
  activated: [
    {
      cost: { mana: "{3}{G}{G}", tap: false },
      targets: [],
      // Every counter of every kind, on each creature you control (itself
      // included), read as the ability resolves.
      effect: {
        kind: "monstrosity",
        amount: { aggregate: "sum", of: "counters", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
