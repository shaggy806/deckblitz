import { defineCard } from "../define.js";

// EDHREC rank 9552.

const FACES = ["Connive // Concoct", "Connive", "Concoct"];
const CONNIVE_TEXT = "Gain control of target creature with power 2 or less.";
const CONCOCT_TEXT = "Surveil 3, then return a creature card from your graveyard to the battlefield.";

// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (connive.ts, concoct.ts).
export default defineCard({
  name: "Connive // Concoct",
  manaCost: "{2}{U/B}{U/B}{3}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: `${CONNIVE_TEXT}\n//\n${CONCOCT_TEXT}`,
  faces: FACES,
  split: true,
});
