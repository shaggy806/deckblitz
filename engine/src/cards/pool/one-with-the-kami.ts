import { defineCard } from "../define.js";

// EDHREC rank 9612.
// Makes Spirit → use "Spirit Token (Colorless)".
//
// Rulings:
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//
// "Enchanted creature or another modified creature you control" is exactly
// "a modified creature you control": the enchanted creature is one you
// control (its enchant restriction) wearing this Aura, which you control, so
// it's modified (rule 700.9). The dies trigger reads the creature as it last
// existed, and X is its last-known power.
const TRIGGER_TEXT =
  "Whenever enchanted creature or another modified creature you control dies, create X 1/1 colorless Spirit creature tokens, where X is that creature's power.";

export default defineCard({
  name: "One with the Kami",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature you control\n${TRIGGER_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", modified: true } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: { powerOf: "trigger-object" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
