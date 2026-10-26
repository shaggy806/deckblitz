import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 27186. Lust for War's static.

const ATTACKS = "Enchanted creature attacks each combat if able.";

export default defineCard({
  name: "Bloodshed Fever",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACKS}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["must-attack"], text: ATTACKS }],
});
