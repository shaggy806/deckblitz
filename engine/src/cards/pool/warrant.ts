import { defineCard } from "../define.js";

const FACES = ["Warrant // Warden", "Warrant", "Warden"];

// The left half of Warrant // Warden (rule 709).
export default defineCard({
  name: "Warrant",
  manaCost: "{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Put target attacking or blocking creature on top of its owner's library.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
  faces: FACES,
  split: true,
});
