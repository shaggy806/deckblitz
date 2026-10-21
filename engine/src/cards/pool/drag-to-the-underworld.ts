import { defineCard } from "../define.js";

// Devotion is counted as the spell is cast and only the generic part goes
// (the rulings): `{ devotionTo }` as a self cost reduction.
export default defineCard({
  name: "Drag to the Underworld",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { devotionTo: ["B"] },
  },
  text: "This spell costs {X} less to cast, where X is your devotion to black. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)\nDestroy target creature.",
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
