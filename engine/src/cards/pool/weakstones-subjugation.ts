import { defineCard } from "../define.js";

// EDHREC rank 24068.
//
// Ruling: the enchanted permanent doesn't untap during its controller's untap step even
//     if you didn't pay {3}.

export default defineCard({
  name: "Weakstone's Subjugation",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact or creature\nWhen this Aura enters, you may pay {3}. If you do, tap enchanted permanent.\nEnchanted permanent doesn't untap during its controller's untap step.",
  targets: ["artifact-or-creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3} to tap enchanted permanent?",
        cost: "{3}",
        effect: { kind: "tap", target: "attached" },
      },
      resolve: null,
      text: "When this Aura enters, you may pay {3}. If you do, tap enchanted permanent.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted permanent doesn't untap during its controller's untap step.",
    },
  ],
});
