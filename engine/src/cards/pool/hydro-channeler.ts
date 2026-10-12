import { defineCard } from "../define.js";

// EDHREC rank 12832. Both abilities' mana is Galazeth Prismari's restricted
// mana (`spendOnly`): it pays only for an instant or sorcery spell.
const BLUE_TEXT = "{T}: Add {U}. Spend this mana only to cast an instant or sorcery spell.";
const ANY_TEXT = "{1}, {T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.";

export default defineCard({
  name: "Hydro-Channeler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${BLUE_TEXT}\n${ANY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: BLUE_TEXT,
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: ANY_TEXT,
    },
  ],
});
