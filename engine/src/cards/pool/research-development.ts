import { defineCard } from "../define.js";

// The whole card: every zone but the stack (rule 709.4), both names, the combined
// mana cost and all its colors. A spell is one half or the other (research.ts,
// development.ts).
const FACES = ["Research // Development", "Research", "Development"];

export default defineCard({
  name: "Research // Development",
  manaCost: "{G}{U}{3}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["instant"],
  text: "Shuffle up to four cards you own from outside the game into your library.\n//\nCreate a 3/1 red Elemental creature token unless any opponent has you draw a card. Repeat this process two more times.",
  faces: FACES,
  split: true,
});
