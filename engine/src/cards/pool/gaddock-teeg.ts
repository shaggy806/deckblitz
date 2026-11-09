import { defineCard } from "../define.js";

// The filters are read of the spell being cast, not the whole card: a split
// card's half by its own cost (the ruling), an {X} spell's mana value with its
// announced X (its mana value on the stack), a free cast by its mana cost.
const MV_TEXT = "Noncreature spells with mana value 4 or greater can't be cast.";
const X_TEXT = "Noncreature spells with {X} in their mana costs can't be cast.";

export default defineCard({
  name: "Gaddock Teeg",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kithkin", "Advisor"],
  power: 2,
  toughness: 2,
  text: `${MV_TEXT}\n${X_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { notTypes: ["creature"], manaValue: { op: "gte", n: 4 } } }],
      text: MV_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { notTypes: ["creature"], xInManaCost: true } }],
      text: X_TEXT,
    },
  ],
});
