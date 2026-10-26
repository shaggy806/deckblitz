import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 20317. One of Theros's five Ordeals.
//
// The attack trigger checks the counters as it resolves (the ruling: a third
// counter put on some other way waits for the next attack). "When you
// sacrifice this Aura" is the `sacrifice` trigger's `selfOnly`, which fires
// however it's sacrificed (the ruling), looking back to the Aura as it left.

const ATTACK = "Whenever enchanted creature attacks, put a +1/+1 counter on it. Then if it has three or more +1/+1 counters on it, sacrifice this Aura.";
const SACRIFICED = "When you sacrifice this Aura, it deals 3 damage to any target.";

const attack: TriggeredAbility = {
  trigger: { on: "attacks", who: "attached" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 3 } } } },
        then: { kind: "sacrifice-source" },
      },
    ],
  },
  resolve: null,
  text: ATTACK,
};

export default defineCard({
  name: "Ordeal of Purphoros",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACK}\n${SACRIFICED}`,
  targets: ["creature"],
  triggered: [
    attack,
    {
      trigger: { on: "sacrifice", who: "you", selfOnly: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: SACRIFICED,
    },
  ],
});
