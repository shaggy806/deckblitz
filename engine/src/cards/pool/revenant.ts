import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 19529.
//
// Rulings:
//   [2020-11-10] The ability that defines Revenant's power and toughness applies in all zones, not
//     just the battlefield.
//   [2020-11-10] As long as Revenant is in your graveyard, its ability will count itself.
//
// A characteristic-defining ability — Bloodsworn Knight's shape.

const PT_TEXT =
  "Revenant's power and toughness are each equal to the number of creature cards in your graveyard.";

export default defineCard({
  name: "Revenant",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
