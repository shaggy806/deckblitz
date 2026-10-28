import { defineCard } from "../define.js";

// Once per damage event the enchanted creature deals, for the total (no
// recipient named — rule 603.2c); the Aura deals it to the creature, the
// trigger object.
const TEXT = "Whenever enchanted creature deals damage, this Aura deals that much damage to that creature.";

export default defineCard({
  name: "Guilty Conscience",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
