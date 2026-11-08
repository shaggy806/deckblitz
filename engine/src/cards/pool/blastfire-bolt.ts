import { defineCard } from "../define.js";

// Any creature, Equipment or not (the ruling); the target illegal as it
// resolves, nothing happens (rule 608.2b). "Attached to that creature" is the
// target slot's (`attachedToObject`).
export default defineCard({
  name: "Blastfire Bolt",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Blastfire Bolt deals 5 damage to target creature. Destroy all Equipment attached to that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "destroy-all", filter: { subtype: "Equipment", attachedToObject: 0 } },
    ],
  },
});
