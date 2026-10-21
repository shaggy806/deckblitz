import { defineCard } from "../define.js";

// Exactly two creatures, no more and no fewer (the ruling): `sacrificeCount`.
export default defineCard({
  name: "Bankrupt in Blood",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice two creatures.\nDraw three cards.",
  targets: [],
  effect: { kind: "draw", amount: 3 },
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" }, sacrificeCount: 2 },
});
