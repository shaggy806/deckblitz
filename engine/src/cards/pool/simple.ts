import { defineCard } from "../define.js";

// The right half of Pure // Simple.
const FACES = ["Pure // Simple", "Pure", "Simple"];

export default defineCard({
  name: "Simple",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["sorcery"],
  text: "Destroy all Auras and Equipment.",
  targets: [],
  effect: { kind: "destroy-all", filter: { subtypes: ["Aura", "Equipment"] } },
  faces: FACES,
  split: true,
});
