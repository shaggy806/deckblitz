import { defineCard } from "../define.js";

const TEXT = "{T}: Add {U}. Spend this mana only to cast an instant or sorcery spell or a kicked spell.";

export default defineCard({
  name: "Volshe Tideturner",
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
        mana: "U",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          purposes: ["kicked-spell"],
          text: "Spend this mana only to cast an instant or sorcery spell or a kicked spell.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
