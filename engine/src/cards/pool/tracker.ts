import { defineCard } from "../define.js";

// Tahngarth's shape; Tracker may target itself (the ruling).

const TEXT =
  "{G}{G}, {T}: This creature deals damage equal to its power to target creature. That creature deals damage equal to its power to this creature.";

export default defineCard({
  name: "Tracker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{G}", tap: true },
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
