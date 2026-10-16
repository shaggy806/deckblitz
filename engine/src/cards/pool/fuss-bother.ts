import { defineCard } from "../define.js";

const FACES = ["Fuss // Bother", "Fuss", "Bother"];
const FUSS_TEXT = "Put a +1/+1 counter on each attacking creature you control.";
const BOTHER_TEXT = "Create three 1/1 colorless Thopter artifact creature tokens with flying. Surveil 2.";

// The whole card: every zone but the stack (rule 709.4) — both names, the
// combined mana cost (mana value 9), an instant and a sorcery. Never cast
// itself; a spell is one half or the other (fuss.ts, bother.ts).
export default defineCard({
  name: "Fuss // Bother",
  manaCost: "{2}{R/W}{4}{W/U}{W/U}",
  colors: ["W", "U", "R"],
  types: ["instant", "sorcery"],
  text: `${FUSS_TEXT}\n//\n${BOTHER_TEXT}`,
  faces: FACES,
  split: true,
});
