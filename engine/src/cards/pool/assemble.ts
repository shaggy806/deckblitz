import { defineCard } from "../define.js";

const FACES = ["Assure // Assemble", "Assure", "Assemble"];
const ASSEMBLE_TEXT = "Create three 2/2 green and white Elf Knight creature tokens with vigilance.";

export default defineCard({
  name: "Assemble",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: ASSEMBLE_TEXT,
  effect: { kind: "create-token", token: "Elf Knight Token", count: 3 },
  faces: FACES,
  split: true,
});
