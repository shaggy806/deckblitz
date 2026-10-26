import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 17909.

const TRIGGER_TEXT =
  "Whenever enchanted creature deals combat damage to a player, that player sacrifices a land of their choice.";

export default defineCard({
  name: "Destructive Urge",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TRIGGER_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
