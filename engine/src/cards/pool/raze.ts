import { defineCard } from "../define.js";

// EDHREC rank 21353.

export default defineCard({
  name: "Raze",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a land.\nDestroy target land.",
  targets: ["land"],
  effect: { kind: "destroy", target: 0 },
  additionalCost: { sacrifice: { type: "land", controlledBy: "you" } },
});
