import { defineCard } from "../define.js";

const FACES = ["Fuss // Bother", "Fuss", "Bother"];
const BOTHER_TEXT = "Create three 1/1 colorless Thopter artifact creature tokens with flying. Surveil 2.";

// The right half of Fuss // Bother (see fuss-bother.ts): a white and blue
// sorcery.
export default defineCard({
  name: "Bother",
  manaCost: "{4}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: BOTHER_TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Thopter Token", count: 3 },
      { kind: "surveil", amount: 2 },
    ],
  },
  faces: FACES,
  split: true,
});
