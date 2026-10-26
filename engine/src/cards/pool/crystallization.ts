import { defineCard } from "../define.js";

// Ruling: the creature is exiled as the trigger resolves even if
// Crystallization has left the battlefield or moved by then — the trigger
// names the creature (its trigger object), not the Aura's host.

export default defineCard({
  name: "Crystallization",
  manaCost: "{G/U}{W}",
  colors: ["W", "U", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block.\nWhen enchanted creature becomes the target of a spell or ability, exile that creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "attached", targeterNotTarget: true },
      targets: [],
      effect: { kind: "exile", target: "trigger-object" },
      resolve: null,
      text: "When enchanted creature becomes the target of a spell or ability, exile that creature.",
    },
  ],
});
