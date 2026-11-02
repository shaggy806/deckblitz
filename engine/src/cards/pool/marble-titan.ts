import { defineCard } from "../define.js";

const TEXT = "Creatures with power 3 or greater don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Marble Titan",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", power: { op: "gte", n: 3 } } },
      restrictions: ["doesnt-untap"],
      text: TEXT,
    },
  ],
});
