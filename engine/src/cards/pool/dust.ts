import { defineCard } from "../define.js";

// The aftermath half of Grind // Dust: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Grind // Dust", "Grind", "Dust"];

export default defineCard({
  name: "Dust",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nExile any number of target creatures that have -1/-1 counters on them.",
  // A target that lost its counters or left isn't exiled; the rest are
  // (the ruling).
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", filter: { type: "creature", counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } } },
    },
  ],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
  faces: FACES,
  split: true,
  aftermath: true,
});
