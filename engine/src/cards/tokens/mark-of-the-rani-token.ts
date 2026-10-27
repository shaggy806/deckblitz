import { defineCard } from "../define.js";

/** The Rani's Mark of the Rani: a red Aura token that pumps and goads. */
const PUMP_TEXT = "Enchanted creature gets +2/+2 and is goaded.";

export default defineCard({
  name: "Mark of the Rani Token",
  art: "da780e8b-55a9-4fbe-b37f-b7b9043f9cdf",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], goads: true, text: PUMP_TEXT }],
});
