import { defineCard } from "../define.js";

const VIGILANCE = "Enchanted creature has vigilance.";
const REGEN = "Sacrifice this Aura: Regenerate enchanted creature.";

export default defineCard({
  name: "Stamina",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${VIGILANCE}\n${REGEN}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: REGEN,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["vigilance"], text: VIGILANCE }],
});
