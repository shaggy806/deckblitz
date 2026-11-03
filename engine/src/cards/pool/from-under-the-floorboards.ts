import { defineCard } from "../define.js";

// Madness with an X in its cost: an alternative cost (rule 702.35b) that
// includes X, so X is announced for it (107.3).

export default defineCard({
  name: "From Under the Floorboards",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Madness {X}{B}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)\nCreate three tapped 2/2 black Zombie creature tokens and you gain 3 life. If this spell's madness cost was paid, instead create X of those tokens and you gain X life.",
  madness: { cost: "{X}{B}{B}" },
  effect: {
    kind: "conditional",
    condition: { kind: "self-alternative-cost-paid", madness: true },
    then: {
      kind: "sequence",
      effects: [
        { kind: "create-token", token: "Zombie Token", count: "x", tapped: true },
        { kind: "gain-life", amount: "x" },
      ],
    },
    else: {
      kind: "sequence",
      effects: [
        { kind: "create-token", token: "Zombie Token", count: 3, tapped: true },
        { kind: "gain-life", amount: 3 },
      ],
    },
  },
});
