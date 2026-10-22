import { defineCard } from "../define.js";

// The half of Leave // Chance cast from the hand. "Permanents you own" —
// one you own but don't control too (the ruling).
const FACES = ["Leave // Chance", "Leave", "Chance"];

export default defineCard({
  name: "Leave",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Return any number of target permanents you own to your hand.",
  targets: [{ kind: "any-number", of: { kind: "permanent", whose: "any", filter: { ownedBy: "you" } } }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0 }, simultaneous: true },
  faces: FACES,
  split: true,
});
