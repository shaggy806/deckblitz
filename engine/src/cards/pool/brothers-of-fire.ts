import { defineCard } from "../define.js";

export default defineCard({
  name: "Brothers of Fire",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{1}{R}{R}: This creature deals 1 damage to any target and 1 damage to you.",
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [{ kind: "damage", amount: 1, target: 0 }, { kind: "damage", amount: 1, who: "you" }],
      },
      resolve: null,
      text: "{1}{R}{R}: This creature deals 1 damage to any target and 1 damage to you.",
    },
  ],
});
