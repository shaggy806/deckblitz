import { defineCard } from "../define.js";

const FACES = ["Fire // Ice", "Fire", "Ice"];

// The right half of Fire // Ice (see fire-ice.ts).
export default defineCard({
  name: "Ice",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap target permanent.\nDraw a card.",
  targets: ["permanent"],
  effect: { kind: "sequence", effects: [{ kind: "tap", target: 0 }, { kind: "draw", amount: 1 }] },
  faces: FACES,
  split: true,
});
