import { defineCard } from "../define.js";

const TEXT = "When enchanted creature dies, target player discards two cards.";

export default defineCard({
  name: "Dying Wail",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
