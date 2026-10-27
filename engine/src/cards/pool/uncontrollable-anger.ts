import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 28797.

const PUMP_TEXT = "Enchanted creature gets +2/+2 and attacks each combat if able.";

export default defineCard({
  name: "Uncontrollable Anger",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${PUMP_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], restrictions: ["must-attack"], text: PUMP_TEXT }],
});
