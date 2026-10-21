import { defineCard } from "../define.js";

// The life is the sacrificed creature's toughness as it last existed on the
// battlefield (the ruling; `toughnessOf: "sacrificed"` reads its last-known
// information). An illegal target fizzles the whole spell, so no life then.
export default defineCard({
  name: "Severed Strands",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nYou gain life equal to the sacrificed creature's toughness. Destroy target creature an opponent controls.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      { kind: "destroy", target: 0 },
    ],
  },
});
