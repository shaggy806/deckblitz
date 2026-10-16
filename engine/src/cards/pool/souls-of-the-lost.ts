import { defineCard } from "../define.js";

// EDHREC rank 10162.
//
// Rulings:
//   [2023-11-10] The ability that defines Souls of the Lost's power and toughness works in all
//     zones. As long as Souls of the Lost is in your graveyard, that ability will count Souls of
//     the Lost itself.
//   [2023-11-10] Cards with the ability word "fathomless descent" have abilities that care how
//     many permanent cards are in your graveyard.
//
// Lightning Axe's choice of additional costs, and Polygoyf's
// characteristic-defining P/T (rule 604.3) over Neo Exdeath's count of
// permanent cards in its owner's graveyard.
const CDA_TEXT =
  "Fathomless descent — Souls of the Lost's power is equal to the number of permanent cards in your graveyard and its toughness is equal to that number plus 1.";

export default defineCard({
  name: "Souls of the Lost",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 1,
  text: `As an additional cost to cast this spell, discard a card or sacrifice a permanent.\n${CDA_TEXT}`,
  additionalCost: {
    options: [
      { discard: 1, text: "Discard a card" },
      { sacrifice: { controlledBy: "you" }, text: "Sacrifice a permanent" },
    ],
  },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { notTypes: ["instant", "sorcery"], ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 1,
      },
      text: CDA_TEXT,
    },
  ],
});
