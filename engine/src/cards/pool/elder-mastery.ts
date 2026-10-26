import { defineCard } from "../define.js";

// Conflux (CON).
//
// Any damage the enchanted creature deals to a player triggers it, not only
// combat damage (the ruling) — Sigil of Sleep's trigger.

const DISCARD = "Whenever enchanted creature deals damage to a player, that player discards two cards.";

export default defineCard({
  name: "Elder Mastery",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +3/+3 and has flying.\n${DISCARD}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +3/+3 and has flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "player" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 2 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
