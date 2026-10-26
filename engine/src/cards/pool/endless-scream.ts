import { defineCard } from "../define.js";

// EDHREC rank 20733.

export default defineCard({
  name: "Endless Scream",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nThis Aura enters with X scream counters on it.\nEnchanted creature gets +1/+0 for each scream counter on this Aura.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "scream", amount: "x" } },
      text: "This Aura enters with X scream counters on it.",
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "scream", pt: [1, 0] },
      text: "Enchanted creature gets +1/+0 for each scream counter on this Aura.",
    },
  ],
});
