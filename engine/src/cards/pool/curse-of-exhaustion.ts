import { defineCard } from "../define.js";

const TEXT = "Enchanted player can't cast more than one spell each turn.";

export default defineCard({
  name: "Curse of Exhaustion",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  static: [{ affects: { scope: "self" }, prohibits: { who: "enchanted-player", spells: true, castLimit: 1 }, text: TEXT }],
});
