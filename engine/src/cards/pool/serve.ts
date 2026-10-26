import { defineCard } from "../define.js";

const FACES = ["Protect // Serve", "Protect", "Serve"];

// The right half of Protect // Serve (see protect-serve.ts).
export default defineCard({
  name: "Serve",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gets -6/-0 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -6, toughness: 0, duration: "end-of-turn" },
  faces: FACES,
  split: true,
});
