import { defineCard } from "../define.js";

// EDHREC rank 12676. Blighted Burgeoning's mana trigger.

const GAIN_TEXT = "When this Aura enters, you gain 2 life.";
const MANA_TEXT = "Whenever enchanted land is tapped for mana, its controller adds an additional one mana of any color.";

export default defineCard({
  name: "Verdant Haven",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GAIN_TEXT}\n${MANA_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: GAIN_TEXT,
    },
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
