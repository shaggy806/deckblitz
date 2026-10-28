import { defineCard } from "../define.js";

// Dissension (DIS). EDHREC rank 21283.

const FACES = ["Hide // Seek", "Hide", "Seek"];
const HIDE_TEXT = "Put target artifact or enchantment on the bottom of its owner's library.";
const SEEK_TEXT =
  "Search target opponent's library for a card and exile it. You gain life equal to its mana value. Then that player shuffles.";

// The whole card: every zone but the stack (rule 709.4). Casting offers each
// half on its own (hide.ts, seek.ts).
export default defineCard({
  name: "Hide // Seek",
  manaCost: "{R}{W}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["instant"],
  text: `${HIDE_TEXT}\n//\n${SEEK_TEXT}`,
  faces: FACES,
  split: true,
});
