import { defineCard } from "../define.js";

// Megalegendary is a deckbuilding rule ("only one copy"): every deck the engine
// builds is singleton (rule 903.5b), so it holds already.
//
// `grantsActivatedOf` never reads the permanent applying it, so "all other
// permanents" is the empty filter; an ability naming its card means Vazal
// (rule 201.5b, the ruling).

const GRANT_TEXT = "Vazal, the Compleat has the activated abilities of all other permanents on the battlefield.";

export default defineCard({
  name: "Vazal, the Compleat",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian"],
  power: 7,
  toughness: 7,
  keywords: ["vigilance", "trample"],
  text: `Megalegendary (Your deck can have only one copy of this card.)\nVigilance, trample\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "battlefield", filter: {} },
      text: GRANT_TEXT,
    },
  ],
});
