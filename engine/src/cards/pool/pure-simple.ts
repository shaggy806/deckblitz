import { defineCard } from "../define.js";

// Dissension. The whole card: every zone but the stack (rule 709.4) — both
// names, the combined mana cost, both halves' colours. Never cast itself; a
// spell is one half or the other (pure.ts, simple.ts).
const FACES = ["Pure // Simple", "Pure", "Simple"];

export default defineCard({
  name: "Pure // Simple",
  manaCost: "{1}{R}{G}{1}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["sorcery"],
  text: "Destroy target multicolored permanent.\n//\nDestroy all Auras and Equipment.",
  faces: FACES,
  split: true,
});
