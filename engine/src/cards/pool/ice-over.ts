import { defineCard } from "../define.js";

// Ruling: Ice Over may target and enchant an untapped permanent.
const LOCK = "Enchanted permanent doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Ice Over",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${LOCK}`,
  targets: ["artifact-or-creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: LOCK }],
});
