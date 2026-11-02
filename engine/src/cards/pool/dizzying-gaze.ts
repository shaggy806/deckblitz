import { defineCard } from "../define.js";

const ACTIVATED = "{R}: Enchanted creature deals 1 damage to target creature with flying.";

export default defineCard({
  name: "Dizzying Gaze",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ACTIVATED}`,
  targets: ["creature-you-control"],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 1, target: 0, from: "attached" },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
