import { defineCard } from "../define.js";

const ATTACK_TEXT = "If a creature with a magnet counter on it attacks, all creatures with magnet counters on them attack if able.";
const BLOCK_TEXT =
  "Whenever a creature with a magnet counter on it attacks, all creatures with magnet counters on them block that creature this turn if able.";
const COUNTER_TEXT = "{1}, {T}: Put a magnet counter on target creature.";
const MAGNETIC = { type: "creature", counters: { kind: "magnet", compare: { op: "gte", n: 1 } } } as const;

export default defineCard({
  name: "Magnetic Web",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ATTACK_TEXT}\n${BLOCK_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: MAGNETIC },
      attacksIfAttacks: MAGNETIC,
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: MAGNETIC },
      targets: [],
      effect: { kind: "block-if-able", filter: MAGNETIC, attacker: "trigger-object" },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "magnet", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
