import { defineCard } from "../define.js";

const TEXT = "Creatures with power 2 or less can't attack you.";

// You, not your planeswalkers (rule 508.1b).
export default defineCard({
  name: "Reverence",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", power: { op: "lte", n: 2 } } },
      restrictions: [{ kind: "cant-attack", at: "you" }],
      text: TEXT,
    },
  ],
});
