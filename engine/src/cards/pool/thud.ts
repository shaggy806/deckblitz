import { defineCard } from "../define.js";

// EDHREC rank 7040.
// The sacrificed creature's power as it last existed on the battlefield
// (the ruling; rule 608.2h) — Fling's shape.
export default defineCard({
  name: "Thud",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nThud deals damage equal to the sacrificed creature's power to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { powerOf: "sacrificed" } },
});
