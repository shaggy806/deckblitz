import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever enchanted creature deals combat damage to a player, you may sacrifice this Aura. If you do, destroy target artifact.";

// The artifact is targeted as the trigger goes on the stack; the sacrifice is
// decided as it resolves, and with the Aura gone by then nothing is destroyed
// (the ruling: `sacrifice-source`'s `then` runs only if it was sacrificed).
export default defineCard({
  name: "Flamespeaker's Will",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\nEnchanted creature gets +1/+1.\n${TRIGGER_TEXT}`,
  targets: ["creature-you-control"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: ["artifact"],
      effect: {
        kind: "may",
        prompt: "Sacrifice Flamespeaker's Will to destroy the target artifact?",
        effect: { kind: "sacrifice-source", then: { kind: "destroy", target: 0 } },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
