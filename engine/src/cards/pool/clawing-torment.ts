import { defineCard } from "../define.js";

// EDHREC rank 8714.
//
// The -1/-1 and "can't block" apply only while the enchanted permanent is a
// creature (Born to Drive's gate); the granted upkeep trigger is the
// enchanted permanent's whatever it is, so "you" is its controller (Morgul-
// Knife Wound's shape).
const CREATURE_TEXT = "As long as enchanted permanent is a creature, it gets -1/-1 and can't block.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you lose 1 life.";

export default defineCard({
  name: "Clawing Torment",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${CREATURE_TEXT}\nEnchanted permanent has "${UPKEEP_TEXT}"`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [-1, -1],
      restrictions: ["cant-block"],
      text: CREATURE_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "lose-life", amount: 1, who: "you" },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: `Enchanted permanent has "${UPKEEP_TEXT}"`,
    },
  ],
});
