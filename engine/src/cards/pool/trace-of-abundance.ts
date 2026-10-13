import { defineCard } from "../define.js";

// EDHREC rank 7004.

const MANA = "Whenever enchanted land is tapped for mana, its controller adds an additional one mana of any color.";

export default defineCard({
  name: "Trace of Abundance",
  manaCost: "{R/W}{G}",
  colors: ["W", "R", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nEnchanted land has shroud. (It can't be the target of spells or abilities.)\n${MANA}`,
  targets: ["land"],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["shroud"], text: "Enchanted land has shroud." }],
  // Fertile Ground's trigger.
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
});
