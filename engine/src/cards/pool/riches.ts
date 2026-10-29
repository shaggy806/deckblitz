import { defineCard } from "../define.js";

// The aftermath half of Rags // Riches: cast only from a graveyard, then exiled
// (rule 702.127a).
//
// Not targeted, so hexproof doesn't stop it (the ruling): each opponent in turn
// order chooses a creature they control, if they control any, and once all have
// chosen you gain control of every chosen one at once, for good (the rulings).
const FACES = ["Rags // Riches", "Rags", "Riches"];

export default defineCard({
  name: "Riches",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nEach opponent chooses a creature they control. You gain control of those creatures.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: "each-opponent",
        for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
      },
      {
        kind: "for-each-voted",
        which: "voted",
        simultaneous: true,
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
