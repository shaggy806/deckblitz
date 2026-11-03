import { defineCard } from "../define.js";

// The land keeps its other supertypes and its subtypes (the ruling), and its
// mana is snow mana now (rule 107.4h).

const SNOW_TEXT = "Enchanted land is snow.";
const MANA_TEXT = "Whenever enchanted land is tapped for mana, its controller adds an additional one mana of any color.";

export default defineCard({
  name: "Glittering Frost",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${SNOW_TEXT}\n${MANA_TEXT}`,
  targets: ["land"],
  static: [{ affects: { scope: "attached" }, addSupertypes: ["snow"], text: SNOW_TEXT }],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
