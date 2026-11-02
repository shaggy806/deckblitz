import { defineCard } from "../define.js";

const TEXT = "Nonwhite creatures with power 3 or greater don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Crackdown",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", notColors: ["W"], power: { op: "gte", n: 3 } } },
      restrictions: ["doesnt-untap"],
      text: TEXT,
    },
  ],
});
