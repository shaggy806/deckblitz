import { defineCard } from "../define.js";

// "The sacrificed creature's power" is its power as it last existed on the
// battlefield (the rulings) — `powerOf: "sacrificed"`.
export default defineCard({
  name: "Tormented Thoughts",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text:
    "As an additional cost to cast this spell, sacrifice a creature.\n" +
    "Target player discards a number of cards equal to the sacrificed creature's power.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: { powerOf: "sacrificed" } },
});
