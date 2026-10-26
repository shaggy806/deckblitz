import { defineCard } from "../define.js";

// EDHREC rank 30434. Shards of Alara. Ruling: it may enchant an untapped
// artifact or creature.
const LOCK = "Enchanted permanent doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Coma Veil",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${LOCK}`,
  targets: ["artifact-or-creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: LOCK }],
});
