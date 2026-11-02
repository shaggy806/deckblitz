import { defineCard } from "../define.js";

const TEXT = "{T}: Add {U}. Spend this mana only to pay a disturb cost or cast an instant or sorcery spell.";

export default defineCard({
  name: "Unblinking Observer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 2,
  toughness: 1,
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
          purposes: ["disturb"],
          text: "Spend this mana only to pay a disturb cost or cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
