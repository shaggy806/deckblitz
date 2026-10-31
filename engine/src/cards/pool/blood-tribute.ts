import { defineCard } from "../define.js";

// Kicker—Tap an untapped Vampire you control (rule 702.33a):
// `also.tapUntapped`, the Vampire picked from the kicked variant's `tapCost`
// (a summoning-sick one too — rule 302.6 is about its own {T} abilities).
// "The life lost this way" is what the opponent actually lost.

export default defineCard({
  name: "Blood Tribute",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker—Tap an untapped Vampire you control. (You may tap a Vampire you control in addition to any other costs as you cast this spell.)\nTarget opponent loses half their life, rounded up. If this spell was kicked, you gain life equal to the life lost this way.",
  targets: ["opponent"],
  effect: { kind: "lose-life", target: 0, amount: { half: { lifeTotal: "each" }, round: "up" } },
  kicker: {
    cost: "",
    also: { text: "Tap an untapped Vampire you control", tapUntapped: { filter: { subtype: "Vampire" }, count: 1 } },
    effect: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", target: 0, amount: { half: { lifeTotal: "each" }, round: "up" } },
        { kind: "gain-life", amount: { lifeLostThisWay: true } },
      ],
    },
  },
});
