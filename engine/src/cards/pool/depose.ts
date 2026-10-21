import { defineCard } from "../define.js";

const FACES = ["Depose // Deploy", "Depose", "Deploy"];

// The left half of Depose // Deploy (rule 709). A legal target that was
// already tapped still draws the card (the ruling).
export default defineCard({
  name: "Depose",
  manaCost: "{1}{W/U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Tap target creature.\nDraw a card.",
  targets: ["creature"],
  effect: { kind: "sequence", effects: [{ kind: "tap", target: 0 }, { kind: "draw", amount: 1 }] },
  faces: FACES,
  split: true,
});
