import { defineCard } from "../define.js";

export default defineCard({
  name: "Femeref Archers",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 2,
  toughness: 2,
  text: "{T}: This creature deals 4 damage to target attacking creature with flying.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 4 damage to target attacking creature with flying.",
    },
  ],
});
