import { defineCard } from "../define.js";

// EDHREC rank 9115.
const MANA_TEXT = "{T}: Add {R}{R}. Spend this mana only to cast Dwarf, Equipment, and Saga spells.";

export default defineCard({
  name: "Fíli and Kíli, Joyous",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 2,
        spendOnly: {
          spell: { subtypes: ["Dwarf", "Equipment", "Saga"] },
          text: "Spend this mana only to cast Dwarf, Equipment, and Saga spells.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
