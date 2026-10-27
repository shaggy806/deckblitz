import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 21089. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both colours. Never cast
// itself; a spell is one half or the other (spite.ts, malice.ts).
const FACES = ["Spite // Malice", "Spite", "Malice"];

export default defineCard({
  name: "Spite // Malice",
  manaCost: "{3}{U}{3}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Counter target noncreature spell.\n//\nDestroy target nonblack creature. It can't be regenerated.",
  faces: FACES,
  split: true,
});
