import { defineCard } from "../define.js";

// The aftermath half of Reason // Believe: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Reason // Believe", "Reason", "Believe"];

export default defineCard({
  name: "Believe",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nLook at the top card of your library. You may put it onto the battlefield if it's a creature card. If you don't, put it into your hand.",
  targets: [],
  // Not revealed unless it goes onto the battlefield (the ruling); declined
  // or not a creature, it goes to your hand.
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 1,
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "battlefield",
    leftover: "hand",
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
