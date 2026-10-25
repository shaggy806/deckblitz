import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever enchanted creature deals combat damage to a player, you may sacrifice this Aura. If you do, destroy target enchantment.";

// The enchantment is targeted as the trigger goes on the stack; whether to
// sacrifice is asked as it resolves, and only a sacrifice that happened
// destroys it (the rulings).
export default defineCard({
  name: "Mortal Obstinacy",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\nEnchanted creature gets +1/+1.\n${TRIGGER_TEXT}`,
  targets: ["creature-you-control"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: ["enchantment"],
      effect: {
        kind: "may",
        prompt: "Sacrifice Mortal Obstinacy to destroy the target enchantment?",
        effect: { kind: "sacrifice-source", then: { kind: "destroy", target: 0 } },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
