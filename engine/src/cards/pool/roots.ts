import { defineCard } from "../define.js";

// EDHREC rank 29171.
//
// "Enchant creature without flying" is the Aura's target filter, which the
// state-based check also reads (704.5m): a host that gains flying sheds it.

export default defineCard({
  name: "Roots",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature without flying\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
