import { defineCard } from "../define.js";

// EDHREC rank 29979. Morningtide.

export default defineCard({
  name: "Hostile Realm",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nEnchanted land has \"{T}: Target creature can't block this turn.\"",
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          resolve: null,
          text: "{T}: Target creature can't block this turn.",
        },
      ],
      text: "Enchanted land has \"{T}: Target creature can't block this turn.\"",
    },
  ],
});
