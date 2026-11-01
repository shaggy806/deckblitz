import { defineCard } from "../define.js";

// The player this Aura enchants: a `would-gain-life` prohibition, and a damage trigger
// (`deals-damage-batch`'s `to: "enchanted-player"`, once per event of damage dealt).

const CANT_GAIN = "Enchanted player can't gain life.";
const HALF = "Whenever enchanted player is dealt damage, they lose half their life, rounded up.";

export default defineCard({
  name: "Grievous Wound",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant player\n${CANT_GAIN}\n${HALF}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "enchanted-player", prevent: true },
      text: CANT_GAIN,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "enchanted-player" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: HALF,
    },
  ],
});
