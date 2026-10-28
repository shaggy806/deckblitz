import { defineCard } from "../define.js";

// Devoid: no colour. "Its controller" is the damage source's controller —
// the trigger object's (`"trigger-controller"`, Backfire's shape); once per
// damage event for the total (no recipient named — rule 603.2c).
const TEXT = "Whenever enchanted creature deals damage, its controller loses that much life.";

export default defineCard({
  name: "Visions of Brutality",
  manaCost: "{1}{B}",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Devoid (This card has no color.)\nEnchant creature\nEnchanted creature can't block.\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-block"],
      text: "Enchanted creature can't block.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: { triggerValue: true }, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
