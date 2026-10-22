import { defineCard } from "../define.js";

const FACES = ["Mouth // Feed", "Mouth", "Feed"];

export default defineCard({
  name: "Feed",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nDraw a card for each creature you control with power 3 or greater.",
  targets: [],
  effect: {
    kind: "draw",
    amount: { countOf: { type: "creature", controlledBy: "you", power: { op: "gte", n: 3 } } },
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
