import { defineCard } from "../define.js";

// EDHREC rank 15691. A split card: this is the card as a whole; each half is
// its own file (collision.ts, colossus.ts).

const FACES = ["Collision // Colossus", "Collision", "Colossus"];
const COLLISION_TEXT = "Collision deals 6 damage to target creature with flying.";
const COLOSSUS_TEXT = "Target creature gets +4/+2 and gains trample until end of turn.";

export default defineCard({
  name: "Collision // Colossus",
  manaCost: "{1}{R/G}{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: `${COLLISION_TEXT}\n//\n${COLOSSUS_TEXT}`,
  faces: FACES,
  split: true,
});
