import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ATTACK_TEXT = "Whenever equipped creature attacks, put a +1/+1 counter on it.";
const ROLL_TEXT =
  "Whenever equipped creature deals combat damage, roll a d12. If the result is greater than the damage dealt or the " +
  "result is 12, double the number of +1/+1 counters on that creature.";

export default defineCard({
  name: "Sword of Hours",
  manaCost: "{2}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACK_TEXT}\n${ROLL_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [equip("{2}")],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "attached", combat: true },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 12,
        then: {
          kind: "conditional",
          condition: {
            kind: "any",
            of: [
              { kind: "amounts", left: { roll: "total" }, op: "gt", right: { triggerValue: true } },
              { kind: "amounts", left: { roll: "total" }, op: "eq", right: 12 },
            ],
          },
          then: { kind: "double-counters", target: "attached", counter: "+1/+1" },
        },
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});
