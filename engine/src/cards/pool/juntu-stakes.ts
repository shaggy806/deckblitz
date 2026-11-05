import { defineCard } from "../define.js";

const TEXT = "Creatures with power 1 or less don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Juntu Stakes",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", power: { op: "lte", n: 1 } } },
      restrictions: ["doesnt-untap"],
      text: TEXT,
    },
  ],
});
