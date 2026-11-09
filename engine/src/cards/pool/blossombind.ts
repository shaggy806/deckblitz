import { defineCard } from "../define.js";

export default defineCard({
  name: "Blossombind",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature can't become untapped and can't have counters put on it.",
  targets: ["creature"],
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
      affects: { scope: "self" },
      prohibits: [
        { act: "untap", object: { hostOfSource: true } },
        { act: "get-counters", object: { hostOfSource: true } },
      ],
      text: "Enchanted creature can't become untapped and can't have counters put on it.",
    },
  ],
});
