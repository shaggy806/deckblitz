import { defineCard } from "../define.js";

// Any damage, not only combat damage. "The other creature" is the creature dealt the damage;
// `whileSource` ends the control as the Aura leaves, and does nothing if it already has (rule
// 611.2b).
const TEXT =
  "Whenever enchanted creature deals damage to a creature, gain control of the other creature for as long as this Aura remains on the battlefield.";

export default defineCard({
  name: "Charisma",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "creature" },
      targets: [],
      effect: { kind: "gain-control", target: "trigger-recipient", untilEndOfTurn: false, whileSource: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
