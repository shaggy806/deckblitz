import { defineCard } from "../define.js";

const FACES = ["Protect // Serve", "Protect", "Serve"];

// The left half of Protect // Serve (see protect-serve.ts).
export default defineCard({
  name: "Protect",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+4 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 4, duration: "end-of-turn" },
  faces: FACES,
  split: true,
});
