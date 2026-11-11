import { defineCard } from "../define.js";

// EDHREC rank 5830.
//
// Rulings:
//   [2024-07-05] "Assassin sources" include any objects with the Assassin creature type: a
//     permanent with changeling or an Assassin card in your hand or graveyard, for example.
//   [2024-07-05] You can use the mana produced by Brotherhood Headquarters's last ability to cast
//     a spell with freerunning even if you're not paying that spell's freerunning cost.
const MANA_TEXT =
  "{T}: Add one mana of any color. Spend this mana only to cast an Assassin spell or a spell that has freerunning, or to activate an ability of an Assassin source.";

export default defineCard({
  name: "Brotherhood Headquarters",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { anyOf: [{ subtype: "Assassin" }, { hasKeyword: "freerunning" }] },
          abilityOf: { subtype: "Assassin" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to cast an Assassin spell or a spell that has freerunning, or to activate an ability of an Assassin source.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
