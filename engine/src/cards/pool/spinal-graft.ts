import { defineCard } from "../define.js";

// The trigger names the creature that became a target (its trigger object),
// so it's destroyed even if the Aura has left by the time it resolves.

export default defineCard({
  name: "Spinal Graft",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +3/+3.\nWhen enchanted creature becomes the target of a spell or ability, destroy that creature. It can't be regenerated.",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "attached", targeterNotTarget: true },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object", cantBeRegenerated: true },
      resolve: null,
      text: "When enchanted creature becomes the target of a spell or ability, destroy that creature. It can't be regenerated.",
    },
  ],
});
