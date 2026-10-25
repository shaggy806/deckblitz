import { defineCard } from "../define.js";

// Two Castigators double damage to you twice (two replacements, 4x); damage
// to one Castigator is doubled only by its own. With other replacements the
// engine applies multipliers in its fixed order (the Furnace of Rath shape).

export default defineCard({
  name: "Goldnight Castigator",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 9,
  keywords: ["flying", "haste"],
  text: "Flying, haste\nIf a source would deal damage to you, it deals double that damage to you instead.\nIf a source would deal damage to this creature, it deals double that damage to this creature instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", multiplier: 2, to: "you" },
      text: "If a source would deal damage to you, it deals double that damage to you instead.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", multiplier: 2, to: "self" },
      text: "If a source would deal damage to this creature, it deals double that damage to this creature instead.",
    },
  ],
});
