import { defineCard } from "../define.js";

export default defineCard({
  name: "Grapeshot Catapult",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 3,
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
