import { defineCard } from "../define.js";

// The aftermath half of Farm // Market: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Farm // Market", "Farm", "Market"];

export default defineCard({
  name: "Market",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nDraw two cards, then discard two cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 2 },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
