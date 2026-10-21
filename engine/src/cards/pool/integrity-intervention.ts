import { defineCard } from "../define.js";

const FACES = ["Integrity // Intervention", "Integrity", "Intervention"];
const INTEGRITY_TEXT = "Target creature gets +2/+2 until end of turn.";
const INTERVENTION_TEXT = "Intervention deals 3 damage to any target and you gain 3 life.";

// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (integrity.ts, intervention.ts).
export default defineCard({
  name: "Integrity // Intervention",
  manaCost: "{R/W}{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: `${INTEGRITY_TEXT}\n//\n${INTERVENTION_TEXT}`,
  faces: FACES,
  split: true,
});
