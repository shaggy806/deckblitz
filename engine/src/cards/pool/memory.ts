import { defineCard } from "../define.js";

// The aftermath half of Commit // Memory: cast only from a graveyard, then exiled.
const FACES = ["Commit // Memory", "Commit", "Memory"];

export default defineCard({
  name: "Memory",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nEach player shuffles their hand and graveyard into their library, then draws seven cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
      { kind: "draw", who: "each-player", amount: 7 },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
