import { defineCard } from "../define.js";

export default defineCard({
  name: "Nova Cleric",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: "{2}{W}, {T}, Sacrifice this creature: Destroy all enchantments.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "enchantment" } },
      resolve: null,
      text: "{2}{W}, {T}, Sacrifice this creature: Destroy all enchantments.",
    },
  ],
});
