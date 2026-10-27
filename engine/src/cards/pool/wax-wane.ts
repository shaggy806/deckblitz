import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 20444. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both colours. Never cast
// itself; a spell is one half or the other (wax.ts, wane.ts).
const FACES = ["Wax // Wane", "Wax", "Wane"];

export default defineCard({
  name: "Wax // Wane",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn.\n//\nDestroy target enchantment.",
  faces: FACES,
  split: true,
});
