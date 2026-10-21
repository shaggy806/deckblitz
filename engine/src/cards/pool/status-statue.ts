import { defineCard } from "../define.js";

const FACES = ["Status // Statue", "Status", "Statue"];
const STATUS_TEXT = "Target creature gets +1/+1 and gains deathtouch until end of turn.";
const STATUE_TEXT = "Destroy target artifact, creature, or enchantment.";

// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (status.ts, statue.ts).
export default defineCard({
  name: "Status // Statue",
  manaCost: "{B/G}{2}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: `${STATUS_TEXT}\n//\n${STATUE_TEXT}`,
  faces: FACES,
  split: true,
});
