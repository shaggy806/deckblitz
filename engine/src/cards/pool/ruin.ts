import { defineCard } from "../define.js";

const FACES = ["Road // Ruin", "Road", "Ruin"];

export default defineCard({
  name: "Ruin",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nRuin deals damage to target creature equal to the number of lands you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
  faces: FACES,
  split: true,
  aftermath: true,
});
