import { defineCard } from "../define.js";

const FACES = ["Order // Chaos", "Order", "Chaos"];

// Apocalypse (APC). The whole card: every zone but the stack (rule 709.4); its
// halves are order.ts and chaos.ts.
export default defineCard({
  name: "Order // Chaos",
  manaCost: "{3}{W}{2}{R}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Exile target attacking creature.\n//\nCreatures can't block this turn.",
  faces: FACES,
  split: true,
});
