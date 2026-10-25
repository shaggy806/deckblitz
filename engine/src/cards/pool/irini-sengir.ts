import { defineCard } from "../define.js";

// EDHREC rank 28304.
//
// One effect over green or white enchantment spells (an `anyOf`), so a
// green-white enchantment costs {2} more once, not twice.

const TEXT = "Green enchantment spells and white enchantment spells cost {2} more to cast.";

export default defineCard({
  name: "Irini Sengir",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Dwarf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { type: "enchantment", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        increaseGeneric: 2,
      },
      text: TEXT,
    },
  ],
});
