import { defineCard } from "../define.js";

const FACES = ["Knowing // Half the Battle", "Knowing", "Half the Battle"];
const KNOWING_TEXT = "Draw three cards.";
const HALF_TEXT = "Search your library for a Battle card, reveal it, put it into your hand, then shuffle.";

// Playtest card (Unknown Event). A split card (rule 709): the whole card in
// every zone but the stack, each half cast on its own (knowing.ts,
// half-the-battle.ts) — Fire // Ice's shape.
export default defineCard({
  name: "Knowing // Half the Battle",
  manaCost: "{3}{U}{U}{2}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: `${KNOWING_TEXT}\n//\n${HALF_TEXT}`,
  faces: FACES,
  split: true,
});
