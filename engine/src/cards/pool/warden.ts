import { defineCard } from "../define.js";

const FACES = ["Warrant // Warden", "Warrant", "Warden"];

// The right half of Warrant // Warden (rule 709).
export default defineCard({
  name: "Warden",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Create a 4/4 white and blue Sphinx creature token with flying and vigilance.",
  targets: [],
  effect: { kind: "create-token", token: "Sphinx Token", count: 1 },
  faces: FACES,
  split: true,
});
