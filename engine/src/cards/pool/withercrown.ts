import { defineCard } from "../define.js";

// EDHREC rank 19101.
//
// Base power 0 is layer 7b, so counters and pumps still apply on top (the
// rulings). "Unless you sacrifice this creature" is the creature's controller
// choosing to sacrifice it; if it wasn't sacrificed — declined, or no longer
// there to sacrifice — they lose the life.
const UPKEEP_TEXT = "At the beginning of your upkeep, you lose 1 life unless you sacrifice this creature.";

export default defineCard({
  name: "Withercrown",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has base power 0 and has "${UPKEEP_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 0 },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "may",
                prompt: "Sacrifice this creature? (If you don't, you lose 1 life.)",
                effect: { kind: "sacrifice-source" },
              },
              {
                kind: "conditional",
                condition: { kind: "not", of: { kind: "this-way", what: "sacrificed", atLeast: 1 } },
                then: { kind: "lose-life", amount: 1, who: "you" },
              },
            ],
          },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: `Enchanted creature has base power 0 and has "${UPKEEP_TEXT}"`,
    },
  ],
});
