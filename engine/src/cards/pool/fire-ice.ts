import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 13168.

const FACES = ["Fire // Ice", "Fire", "Ice"];
const FIRE_TEXT = "Fire deals 2 damage divided as you choose among one or two targets.";
const ICE_TEXT = "Tap target permanent.\nDraw a card.";

// The whole card: every zone but the stack (rule 709.4), mana value 4 there
// (the rulings). Casting offers each half on its own (fire.ts, ice.ts).
export default defineCard({
  name: "Fire // Ice",
  manaCost: "{1}{R}{1}{U}",
  colors: ["U", "R"],
  types: ["instant"],
  text: `${FIRE_TEXT}\n//\n${ICE_TEXT}`,
  faces: FACES,
  split: true,
});
