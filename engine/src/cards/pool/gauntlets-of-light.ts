import { defineCard } from "../define.js";

// Core Set 2020. Only combat damage is resized (the ruling): its power is
// unchanged for a fight or anything else that reads it.
const PUMP_TEXT =
  "Enchanted creature gets +0/+2 and assigns combat damage equal to its toughness rather than its power.";
const GRANTED_TEXT = "{2}{W}: Untap this creature.";

export default defineCard({
  name: "Gauntlets of Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\nEnchanted creature has "${GRANTED_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      combatDamageByToughness: "always",
      text: PUMP_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{2}{W}", tap: false },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Enchanted creature has "${GRANTED_TEXT}"`,
    },
  ],
});
