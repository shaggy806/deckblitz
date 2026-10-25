import { defineCard } from "../define.js";

// EDHREC rank 29287.
// The counter is checked as the spell resolves.
export default defineCard({
  name: "Bring Low",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Bring Low deals 3 damage to target creature. If that creature has a +1/+1 counter on it, Bring Low deals 5 damage to it instead.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      ifCondition: { kind: "target", index: 0, filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      then: 5,
      else: 3,
    },
  },
});
