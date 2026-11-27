import { defineCard } from "../define.js";

// EDHREC rank 27260. The whole card: every zone but the stack (rule 709.4) —
// both names, the combined mana cost, all three colours. Never cast itself; a
// spell is one half or the other (rise.ts, fall.ts).
const FACES = ["Rise // Fall", "Rise", "Fall"];

export default defineCard({
  name: "Rise // Fall",
  manaCost: "{U}{B}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text: "Return target creature card from a graveyard and target creature on the battlefield to their owners' hands.\n//\nTarget player reveals two cards at random from their hand, then discards each nonland card revealed this way.",
  faces: FACES,
  split: true,
});
