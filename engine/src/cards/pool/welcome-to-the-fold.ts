import { defineCard } from "../define.js";

// The target is any creature: its toughness is read as the spell resolves.

export default defineCard({
  name: "Welcome to the Fold",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Madness {X}{U}{U} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)\nGain control of target creature if its toughness is 2 or less. If this spell's madness cost was paid, instead gain control of that creature if its toughness is X or less.",
  madness: { cost: "{X}{U}{U}" },
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "self-alternative-cost-paid", madness: true },
    then: {
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { toughness: { op: "lte", n: "x" } } },
      then: { kind: "gain-control", target: 0, untilEndOfTurn: false },
    },
    else: {
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { toughness: { op: "lte", n: 2 } } },
      then: { kind: "gain-control", target: 0, untilEndOfTurn: false },
    },
  },
});
