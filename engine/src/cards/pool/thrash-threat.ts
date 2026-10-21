import { defineCard } from "../define.js";

// EDHREC rank 18247. A split card: this is the card as a whole; each half is
// its own file (thrash.ts, threat.ts).

const FACES = ["Thrash // Threat", "Thrash", "Threat"];
const THRASH_TEXT =
  "Target creature you control deals damage equal to its power to target creature or planeswalker you don't control.";
const THREAT_TEXT = "Create a 4/4 red and green Beast creature token with trample.";

export default defineCard({
  name: "Thrash // Threat",
  manaCost: "{R/G}{R/G}{2}{R}{G}",
  colors: ["R", "G"],
  types: ["instant", "sorcery"],
  text: `${THRASH_TEXT}\n//\n${THREAT_TEXT}`,
  faces: FACES,
  split: true,
});
