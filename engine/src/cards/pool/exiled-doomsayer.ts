import { defineCard } from "../define.js";

// EDHREC rank 32053. A megamorph cost is a morph cost (rule 702.37b); a disguise
// cost isn't, and casting one face down isn't affected (its reminder text).
const TAX_TEXT = "All morph costs cost {2} more. (This doesn't affect the cost to cast creature spells face down.)";

export default defineCard({
  name: "Exiled Doomsayer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TAX_TEXT,
  static: [{ affects: { scope: "self" }, morphCostIncrease: 2, text: TAX_TEXT }],
});
