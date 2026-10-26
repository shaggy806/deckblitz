import { defineCard } from "../define.js";

const PUMP_TEXT = "Enchanted creature gets +2/+2 and attacks each combat if able.";

export default defineCard({
  name: "Furor of the Bitten",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], restrictions: ["must-attack"], text: PUMP_TEXT }],
});
