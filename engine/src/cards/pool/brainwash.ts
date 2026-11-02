import { defineCard } from "../define.js";

const TEXT = "Enchanted creature can't attack unless its controller pays {3}.";

// A cost to attack (rule 508.1h): {3} whoever it attacks, paid by whoever
// controls the creature, and no requirement obliges it (508.1d).
export default defineCard({
  name: "Brainwash",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, combatTax: { on: ["attack"], generic: 3 }, text: TEXT }],
});
