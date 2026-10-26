import { defineCard } from "../define.js";

const TEXT = "{T}: This creature deals 1 damage to each creature with flying.";

export default defineCard({
  name: "Scattershot Archer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "damage-all", amount: 1, filter: { type: "creature", keyword: "flying" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
