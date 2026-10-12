import { defineCard } from "../define.js";

export default defineCard({
  name: "D'Avenant Healer",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Archer"],
  power: 1,
  toughness: 2,
  text: "{T}: This creature deals 1 damage to target attacking or blocking creature.\n{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target attacking or blocking creature.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
  ],
});
