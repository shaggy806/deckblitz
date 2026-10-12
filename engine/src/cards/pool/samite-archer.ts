import { defineCard } from "../define.js";

export default defineCard({
  name: "Samite Archer",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Archer"],
  power: 1,
  toughness: 1,
  text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.\n{T}: This creature deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to any target.",
    },
  ],
});
