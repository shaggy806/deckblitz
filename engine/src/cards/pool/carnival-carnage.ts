import { defineCard } from "../define.js";

const FACES = ["Carnival // Carnage", "Carnival", "Carnage"];
const CARNIVAL_TEXT =
  "Carnival deals 1 damage to target creature or planeswalker and 1 damage to that permanent's controller.";
const CARNAGE_TEXT = "Carnage deals 3 damage to target opponent. That player discards two cards.";

// Ravnica Allegiance. The whole card: every zone but the stack (rule 709.4) —
// both names, the combined mana cost (mana value 5), an instant and a
// sorcery. Never cast itself; a spell is one half or the other (carnival.ts,
// carnage.ts).
export default defineCard({
  name: "Carnival // Carnage",
  manaCost: "{B/R}{2}{B}{R}",
  colors: ["B", "R"],
  types: ["instant", "sorcery"],
  text: `${CARNIVAL_TEXT}\n//\n${CARNAGE_TEXT}`,
  faces: FACES,
  split: true,
});
