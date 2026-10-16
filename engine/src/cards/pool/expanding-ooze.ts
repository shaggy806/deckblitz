import { defineCard } from "../define.js";

// EDHREC rank 17528.
//
// "Modified" is rule 700.9 (`filter.modified`): a counter of any kind, an
// Equipment anyone controls, or an Aura its controller controls — an
// opponent's Aura doesn't count (the rulings). Adapt asks as it resolves.
const ADAPT_TEXT = "{B}{G}: Adapt 1. (If this creature has no +1/+1 counters on it, put a +1/+1 counter on it.)";
const ATTACK_TEXT =
  "Whenever this creature attacks, put a +1/+1 counter on target modified creature you control. (Equipment, Auras you control, and counters are modifications.)";

export default defineCard({
  name: "Expanding Ooze",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 3,
  toughness: 3,
  text: `${ADAPT_TEXT}\n${ATTACK_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}{G}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", modified: true } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks, put a +1/+1 counter on target modified creature you control.",
    },
  ],
});
