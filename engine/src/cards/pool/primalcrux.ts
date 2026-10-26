import { defineCard } from "../define.js";

// EDHREC rank 19144.
//
// Rulings:
//   [2008-08-01] This will count the number of symbols in its mana cost while it's on the
//     battlefield. The ability functions while it's in other zones, but since it isn't a permanent
//     while in those zones it won't count itself.
//   [2008-08-01] Chroma abilities check only mana costs, which are found in a card's upper right
//     corner. They don't count mana symbols that appear in a card's text box.
//   [2008-08-01] Chroma abilities count hybrid mana symbols of the appropriate color. For example,
//     a card with mana cost {3}{U/R}{U/R} has two red mana symbols in its mana cost.
//
// Chroma over the mana costs of permanents you control is devotion (rule
// 700.5), hybrid symbols included.

export default defineCard({
  name: "Primalcrux",
  manaCost: "{G}{G}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: "Trample\nChroma — This creature's power and toughness are each equal to the number of green mana symbols in the mana costs of permanents you control.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { devotionTo: ["G"] }, plusPower: 0, plusToughness: 0 },
      text: "Chroma — This creature's power and toughness are each equal to the number of green mana symbols in the mana costs of permanents you control.",
    },
  ],
});
