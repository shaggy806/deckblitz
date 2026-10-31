import { defineCard } from "../define.js";

const TEXT =
  "Nonartifact spells you cast have improvise. (Your artifacts can help cast those spells. Each artifact you tap after you're done activating mana abilities pays for {1}.)";

// Improvise on each nonartifact spell as it's cast (rule 702.126): an
// artifact tapped pays {1}, never a coloured pip; a spell with convoke as
// well taps creatures for that (its rulings).
export default defineCard({
  name: "Inspiring Statuary",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, grantsToSpells: { filter: { notTypes: ["artifact"] }, improvise: true }, text: TEXT }],
});
