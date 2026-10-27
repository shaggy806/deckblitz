import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29918. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both colours. Never cast
// itself; a spell is one half or the other (stand.ts, deliver.ts).
const FACES = ["Stand // Deliver", "Stand", "Deliver"];

export default defineCard({
  name: "Stand // Deliver",
  manaCost: "{W}{2}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Prevent the next 2 damage that would be dealt to target creature this turn.\n//\nReturn target permanent to its owner's hand.",
  faces: FACES,
  split: true,
});
