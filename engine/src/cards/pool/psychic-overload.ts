import { defineCard } from "../define.js";

export default defineCard({
  name: "Psychic Overload",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant permanent\nWhen this Aura enters, tap enchanted permanent.\nEnchanted permanent doesn't untap during its controller's untap step.\nEnchanted permanent has \"Discard two artifact cards: Untap this permanent.\"",
  targets: ["permanent"],
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
      restrictions: ["doesnt-untap"],
      text: "Enchanted permanent doesn't untap during its controller's untap step.",
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: false, discard: { count: 2, filter: { type: "artifact" } } },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: "Discard two artifact cards: Untap this permanent.",
        },
      ],
      text: "Enchanted permanent has \"Discard two artifact cards: Untap this permanent.\"",
    },
  ],
});
