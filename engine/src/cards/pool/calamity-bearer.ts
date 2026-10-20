import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 9465. Angrath's Marauders narrowed to Giant
// sources: damage is divided or assigned first, then doubled (the ruling),
// and it's still dealt by the original source.
const TEXT =
  "If a Giant source you control would deal damage to a permanent or player, it deals double that damage to that permanent or player instead.";

export default defineCard({
  name: "Calamity Bearer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Berserker"],
  power: 3,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", multiplier: 2, source: { controlledBy: "you", subtype: "Giant" } },
      text: TEXT,
    },
  ],
});
