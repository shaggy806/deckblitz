import { defineCard } from "../define.js";

const FACES = ["Gallifrey Falls // No More", "Gallifrey Falls", "No More"];

// The right half of Gallifrey Falls // No More (see gallifrey-falls-no-more.ts).
export default defineCard({
  name: "No More",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Any number of target creatures you control phase out.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [{ kind: "any-number", of: "creature-you-control" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "phase-out", target: 0 },
  },
  faces: FACES,
  split: true,
});
