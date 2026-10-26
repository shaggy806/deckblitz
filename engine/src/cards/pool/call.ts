import { defineCard } from "../define.js";

const FACES = ["Beck // Call", "Beck", "Call"];

// The right half of Beck // Call (see beck-call.ts).
export default defineCard({
  name: "Call",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Create four 1/1 white Bird creature tokens with flying.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: { kind: "create-token", token: "Bird Token", count: 4 },
  faces: FACES,
  split: true,
});
