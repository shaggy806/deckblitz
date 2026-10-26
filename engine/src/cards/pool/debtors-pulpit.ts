import { defineCard } from "../define.js";

// EDHREC rank 26917.

export default defineCard({
  name: "Debtor's Pulpit",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nEnchanted land has \"{T}: Tap target creature.\"",
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: "{T}: Tap target creature.",
        },
      ],
      text: "Enchanted land has \"{T}: Tap target creature.\"",
    },
  ],
});
