import { defineCard } from "../define.js";

const FACES = ["Bedeck // Bedazzle", "Bedeck", "Bedazzle"];
const BEDECK_TEXT = "Target creature gets +3/-3 until end of turn.";
const BEDAZZLE_TEXT = "Destroy target nonbasic land. Bedazzle deals 2 damage to target opponent or planeswalker.";

// EDHREC rank 24473.
//
// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (bedeck.ts, bedazzle.ts).
export default defineCard({
  name: "Bedeck // Bedazzle",
  manaCost: "{B/R}{B/R}{4}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: `${BEDECK_TEXT}\n//\n${BEDAZZLE_TEXT}`,
  faces: FACES,
  split: true,
});
