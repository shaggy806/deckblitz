import { defineCard } from "../define.js";

// "Creatures can't be the targets of spells" — every creature, every
// player's spells, abilities untouched (rule 601.2c): a quality-less
// `hexproofFrom` with `spellsOnly` and `anyController`.
const TARGET_TEXT = "Creatures can't be the targets of spells.";

export default defineCard({
  name: "Dense Foliage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TARGET_TEXT,
  static: [
    { affects: { scope: "all-creatures" }, hexproofFrom: { spellsOnly: true, anyController: true, notHexproof: true }, text: TARGET_TEXT },
  ],
});
