import { defineCard } from "../define.js";

// Ravnica Allegiance. The power check comes after the sacrifice (the ruling),
// gains 4 however many such creatures you control, and gains even when the
// opponent had nothing to sacrifice (the rulings).
export default defineCard({
  name: "Undercity's Embrace",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Target opponent sacrifices a creature of their choice. If you control a creature with power 4 or greater, you gain 4 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
        then: { kind: "gain-life", amount: 4 },
      },
    ],
  },
});
