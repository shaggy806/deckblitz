import { defineCard } from "../define.js";

export default defineCard({
  name: "Magma Vein",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{R}, Sacrifice a land: This enchantment deals 1 damage to each creature without flying.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      resolve: null,
      text: "{R}, Sacrifice a land: This enchantment deals 1 damage to each creature without flying.",
    },
  ],
});
