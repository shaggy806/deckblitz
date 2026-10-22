import { defineCard } from "../define.js";

// EDHREC rank 12011. Amonkhet. The whole card: every zone but the stack (rule
// 709.4) — both names, the combined mana cost, both types. Never cast itself;
// a spell is one half or the other (never.ts, and return.ts with aftermath,
// rule 702.127a).
const FACES = ["Never // Return", "Never", "Return"];

export default defineCard({
  name: "Never // Return",
  manaCost: "{1}{B}{B}{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature or planeswalker.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nExile target card from a graveyard. Create a 2/2 black Zombie creature token.",
  faces: FACES,
  split: true,
});
