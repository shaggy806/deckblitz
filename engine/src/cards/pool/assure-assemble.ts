import { defineCard } from "../define.js";

const FACES = ["Assure // Assemble", "Assure", "Assemble"];
const ASSURE_TEXT = "Put a +1/+1 counter on target creature. That creature gains indestructible until end of turn.";
const ASSEMBLE_TEXT = "Create three 2/2 green and white Elf Knight creature tokens with vigilance.";

// The whole card: every zone but the stack (rule 709.4) — both names, the
// combined mana cost (mana value 8), two instants. Never cast itself; a
// spell is one half or the other (assure.ts, assemble.ts).
export default defineCard({
  name: "Assure // Assemble",
  manaCost: "{G/W}{G/W}{4}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: `${ASSURE_TEXT}\n//\n${ASSEMBLE_TEXT}`,
  faces: FACES,
  split: true,
});
