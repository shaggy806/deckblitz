import { defineCard } from "../define.js";

// Conflux (CON).
//
// "Enchant red or green creature" is the target filter, which the
// state-based check reads too (704.5m — Decomposition): a creature that stops
// being red or green sheds it.

export default defineCard({
  name: "Controlled Instincts",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant red or green creature\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
