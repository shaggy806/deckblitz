import { defineCard } from "../define.js";

export default defineCard({
  name: "Fireslinger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: This creature deals 1 damage to any target and 1 damage to you.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [{ kind: "damage", amount: 1, target: 0 }, { kind: "damage", amount: 1, who: "you" }],
      },
      resolve: null,
      text: "{T}: This creature deals 1 damage to any target and 1 damage to you.",
    },
  ],
});
