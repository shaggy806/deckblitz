import { defineCard } from "../define.js";

const ENTERS =
  "When this Aura enters, target player sacrifices a creature of their choice other than enchanted creature.";
const DEALT = "When enchanted creature is dealt damage, destroy it.";

// Any player can be the target, not just the enchanted creature's controller
// (the ruling).
export default defineCard({
  name: "Sporogenic Infection",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${DEALT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1, exceptHost: true },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DEALT,
    },
  ],
});
