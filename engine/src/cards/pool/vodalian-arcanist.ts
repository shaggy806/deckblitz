import { defineCard } from "../define.js";

// EDHREC rank 17601. Hydro-Channeler's restricted mana (`spendOnly`), colourless.

const TEXT = "{T}: Add {C}. Spend this mana only to cast an instant or sorcery spell.";

export default defineCard({
  name: "Vodalian Arcanist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
