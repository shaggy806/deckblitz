import { defineCard } from "../define.js";

// The 0/0 tokens die to the next state-based check (rule 704.5f), as printed.
export default defineCard({
  name: "Imaginary Friends",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Create three 0/0 white Spirit creature tokens with flying.",
  effect: { kind: "create-token", token: "0/0 White Spirit Token (Flying)", count: 3 },
});
