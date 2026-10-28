import { defineCard } from "../define.js";

// EDHREC rank 15961.

const STATIC_TEXT = "Enchanted permanent loses all abilities and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Stop Cold",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant artifact or creature\nWhen this Aura enters, tap enchanted permanent.\n${STATIC_TEXT}`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted permanent.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      restrictions: ["doesnt-untap"],
      text: STATIC_TEXT,
    },
  ],
});
