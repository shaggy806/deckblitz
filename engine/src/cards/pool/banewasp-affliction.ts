import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] The player who loses life is the player who controlled the creature when it was
//     put into a graveyard. This may not be the player whose graveyard it was put into. That
//     player loses life equal to the creature’s toughness as it last existed on the battlefield.

const TEXT = "When enchanted creature dies, that creature's controller loses life equal to its toughness.";

export default defineCard({
  name: "Banewasp Affliction",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: { toughnessOf: "trigger-object" }, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
