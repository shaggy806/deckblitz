import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 30586.

const TEXT = "Enchanted creature gets +2/+2 and can't attack.";

export default defineCard({
  name: "Cagemail",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], restrictions: ["cant-attack"], text: TEXT }],
});
