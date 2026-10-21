import { defineCard } from "../define.js";

// EDHREC rank 27103. Rivals of Ixalan.
//
// The sacrifice is an intervening if (rule 603.4) on whether you attacked
// with any creature this turn, raid's turn stat — the enchanted creature
// needn't have been the one (the ruling).

export default defineCard({
  name: "See Red",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+1 and has first strike.\nAt the beginning of your end step, if you didn't attack with a creature this turn, sacrifice this Aura.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "not", of: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of your end step, if you didn't attack with a creature this turn, sacrifice this Aura.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantKeywords: ["first-strike"],
      text: "Enchanted creature gets +2/+1 and has first strike.",
    },
  ],
});
