import { defineCard } from "../define.js";

// One-sided damage both ways, not a fight: first strike doesn't matter; the
// Yeti gone, it still deals its damage (the rulings — Predatory Urge's shape).

const TEXT =
  "{T}: This creature deals damage equal to its power to target creature. That creature deals damage equal to its power to this creature.";

export default defineCard({
  name: "Karplusan Yeti",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          { kind: "fight", a: 0, b: "source", oneSided: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
