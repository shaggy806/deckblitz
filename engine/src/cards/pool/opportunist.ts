import { defineCard } from "../define.js";

export default defineCard({
  name: "Opportunist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "{T}: This creature deals 1 damage to target creature that was dealt damage this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target creature that was dealt damage this turn.",
    },
  ],
});
