import { defineCard } from "../define.js";

export default defineCard({
  name: "Titanic Brawl",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets a creature you control with a +1/+1 counter on it.\nTarget creature you control fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  targetCostReduction: {
    filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
    reduceGeneric: 1,
  },
  effect: { kind: "fight", a: 0, b: 1 },
});
