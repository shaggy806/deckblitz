import { defineCard } from "../define.js";

// Rulings:
//   [2020-04-17] If you don't put the card you look at into your graveyard, it remains on top of your
//     library. You'll draw it during your draw step unless something else moves it.
//   [2020-04-17] Mana produced by Titans' Nest can be used to cast a spell that has {X} in an
//     additional or alternative cost.
const UPKEEP = "At the beginning of your upkeep, surveil 1.";
const MANA =
  "Exile a card from your graveyard: Add {C}. Spend this mana only to cast a spell that's one or more colors without {X} in its mana cost.";

export default defineCard({
  name: "Titans' Nest",
  manaCost: "{1}{B}{G}{U}",
  colors: ["B", "G", "U"],
  types: ["enchantment"],
  text: `${UPKEEP} (Look at the top card of your library. You may put that card into your graveyard.)\n${MANA}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 1 } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: {
          spell: { colorless: false, xInManaCost: false },
          text: "Spend this mana only to cast a spell that's one or more colors without {X} in its mana cost.",
        },
      },
      resolve: null,
      text: MANA,
    },
  ],
});
