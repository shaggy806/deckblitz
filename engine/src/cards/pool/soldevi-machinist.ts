import { defineCard } from "../define.js";

// EDHREC rank 28030.
//
// Rulings:
//   [2008-08-01] Mana from the ability can only be spent on activation costs for abilities from
//     artifacts. It can't be spent on artifact spells, or on costs resulting from triggered
//     abilities.

const TEXT = "{T}: Add {C}{C}. Spend this mana only to activate abilities of artifacts.";

export default defineCard({
  name: "Soldevi Machinist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Artificer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        // "Abilities of artifacts" — artifact permanents (rule 109.2), not
        // artifact cards elsewhere.
        spendOnly: { abilityOf: { type: "artifact" }, text: "Spend this mana only to activate abilities of artifacts." },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
