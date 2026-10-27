import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 14696. The Aura's controller
// creates the Saprolings; "that many" is the damage dealt (Tana's
// `triggerValue`).
const TRIGGER_TEXT =
  "Whenever enchanted creature deals combat damage to a player, create that many 1/1 green Saproling creature tokens.";

export default defineCard({
  name: "Pollenbright Wings",
  manaCost: "{4}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has flying.\n${TRIGGER_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: { triggerValue: true } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
