import { defineCard } from "../define.js";

const TEXT = "{1}{R}: This creature deals 1 damage to any target and 1 damage to itself.";

export default defineCard({
  name: "Reckless Embermage",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
