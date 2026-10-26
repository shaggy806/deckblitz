import { defineCard } from "../define.js";

const FACES = ["Boom // Bust", "Boom", "Bust"];

// The right half of Boom // Bust (see boom-bust.ts).
export default defineCard({
  name: "Bust",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all lands.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "land" } },
  faces: FACES,
  split: true,
});
