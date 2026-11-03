import { defineCard } from "../define.js";

const LEGENDARY_TEXT = "Enchanted permanent is legendary.";

export default defineCard({
  name: "In Bolas's Clutches",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant permanent\nYou control enchanted permanent.\n${LEGENDARY_TEXT}`,
  targets: ["permanent"],
  controlEnchanted: true,
  static: [{ affects: { scope: "attached" }, addSupertypes: ["legendary"], text: LEGENDARY_TEXT }],
});
