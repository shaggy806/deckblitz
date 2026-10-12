import { defineCard } from "../define.js";

export default defineCard({
  name: "Skyway Sniper",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\n{2}{G}: This creature deals 1 damage to target creature with flying.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{2}{G}: This creature deals 1 damage to target creature with flying.",
    },
  ],
});
