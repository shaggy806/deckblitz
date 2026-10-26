import { defineCard } from "../define.js";

// EDHREC rank 12586.
//
// Rulings:
//   [2013-01-24] Use the creature’s power the last time it was on the battlefield to determine how
//     much life the target player loses and how much life you gain.
//   [2013-01-24] If another player gains control of either Dying Wish or the enchanted creature
//     (but not both), Dying Wish will be enchanting an illegal permanent. The Aura will be put
//     into its owner’s graveyard as a state-based action.

export default defineCard({
  name: "Dying Wish",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature you control\nWhen enchanted creature dies, target player loses X life and you gain X life, where X is its power.",
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: ["player"],
      // X is the creature's power as it last existed on the battlefield.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { powerOf: "trigger-object" }, target: 0 },
          { kind: "gain-life", amount: { powerOf: "trigger-object" } },
        ],
      },
      resolve: null,
      text: "When enchanted creature dies, target player loses X life and you gain X life, where X is its power.",
    },
  ],
});
