import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 20955.
//
// Rulings:
//   [2022-02-18] A card in your graveyard that is both an artifact and an enchantment is only
//     counted once.
const TEXT = "This creature gets +1/+0 for each artifact and/or enchantment card in your graveyard.";

export default defineCard({
  name: "Runaway Trash-Bot",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        inGraveyard: { typesAnyOf: ["artifact", "enchantment"], ownedBy: "you" },
        pt: [1, 0],
      },
      text: TEXT,
    },
  ],
});
