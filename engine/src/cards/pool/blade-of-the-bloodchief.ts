import { defineCard } from "../define.js";

// The creature equipped as the ability resolves gets the counters, or — the
// Blade gone — the one it was attached to as it left (the rulings): the
// `"attached"` reference. "Is a Vampire" asks that creature as it is now.
const DIES =
  "Whenever a creature dies, put a +1/+1 counter on equipped creature. If equipped creature is a Vampire, put two +1/+1 counters on it instead.";

export default defineCard({
  name: "Blade of the Bloodchief",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${DIES}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { attachedTo: { subtype: "Vampire" } } },
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 2 },
        else: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: DIES,
    },
  ],
});
