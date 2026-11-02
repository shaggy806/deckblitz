import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] This mana may not be used to pay costs imposed after the spell is initially cast.
//   [2004-10-04] This mana may be used on additional costs to cast the spell, such as Kicker.

const TEXT =
  "Exile a creature you control: Add X mana of any one color, where X is 1 plus the exiled creature's mana value. Spend this mana only to cast creature spells.";

export default defineCard({
  name: "Food Chain",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature", controlledBy: "you" } }, exilesSacrifice: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { sum: [1, { manaValueOf: "sacrificed" }] },
        spendOnly: { spell: { type: "creature" }, text: "Spend this mana only to cast creature spells." },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
