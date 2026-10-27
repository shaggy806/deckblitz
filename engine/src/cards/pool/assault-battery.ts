import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28259. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both colours. Never cast
// itself; a spell is one half or the other (assault.ts, battery.ts).
const FACES = ["Assault // Battery", "Assault", "Battery"];

export default defineCard({
  name: "Assault // Battery",
  manaCost: "{R}{3}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Assault deals 2 damage to any target.\n//\nCreate a 3/3 green Elephant creature token.",
  faces: FACES,
  split: true,
});
