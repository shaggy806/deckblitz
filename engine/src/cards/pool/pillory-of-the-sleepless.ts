import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 18917.
//
// The upkeep trigger is the creature's own (granted), so "you" is the
// creature's controller.
//
// Rulings:
//   [2018-03-16] The controller of the enchanted creature will lose 1 life, not the controller of
//     Pillory of the Sleepless.

export default defineCard({
  name: "Pillory of the Sleepless",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block.\nEnchanted creature has \"At the beginning of your upkeep, you lose 1 life.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "lose-life", amount: 1, who: "you" },
          resolve: null,
          text: "At the beginning of your upkeep, you lose 1 life.",
        },
      ],
      text: "Enchanted creature has \"At the beginning of your upkeep, you lose 1 life.\"",
    },
  ],
});
