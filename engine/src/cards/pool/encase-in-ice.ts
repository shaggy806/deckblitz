import { defineCard } from "../define.js";

const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";

// "Enchant red or green creature": the Aura's target spec, which the
// state-based check also reads (rule 704.5m) — a creature that stops being red
// or green, or a creature, sheds it (the ruling).
export default defineCard({
  name: "Encase in Ice",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nEnchant red or green creature\n${ENTER_TEXT}\n${UNTAP_TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
