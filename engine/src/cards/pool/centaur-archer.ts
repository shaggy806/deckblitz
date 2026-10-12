import { defineCard } from "../define.js";

export default defineCard({
  name: "Centaur Archer",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Centaur", "Archer"],
  power: 3,
  toughness: 2,
  text: "{T}: This creature deals 1 damage to target creature with flying.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target creature with flying.",
    },
  ],
});
