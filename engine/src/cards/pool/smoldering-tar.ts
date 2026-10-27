import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29620.

const UPKEEP = "At the beginning of your upkeep, target player loses 1 life.";
const SAC = "Sacrifice this enchantment: It deals 4 damage to target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Smoldering Tar",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${SAC}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 4 },
      resolve: null,
      sorcerySpeed: true,
      text: SAC,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 1, target: 0 },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
