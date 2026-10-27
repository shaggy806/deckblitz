import { defineCard } from "../define.js";

export default defineCard({
  name: "Unified Strike",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target attacking creature if its power is less than or equal to the number of Soldiers on the battlefield.",
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: {
    kind: "conditional",
    // Read as it resolves: every Soldier on the battlefield, anyone's.
    condition: {
      kind: "target",
      index: 0,
      filter: { power: { op: "lte", n: { amount: { countOf: { subtype: "Soldier" } } } } },
    },
    then: { kind: "exile", target: 0 },
  },
});
