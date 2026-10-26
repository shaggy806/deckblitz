import { defineCard } from "../define.js";

const FACES = ["Boom // Bust", "Boom", "Bust"];

// The whole card: every zone but the stack (rule 709.4); boom.ts and bust.ts
// are the halves.
export default defineCard({
  name: "Boom // Bust",
  manaCost: "{1}{R}{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land you control and target land you don't control.\n//\nDestroy all lands.",
  faces: FACES,
  split: true,
});
