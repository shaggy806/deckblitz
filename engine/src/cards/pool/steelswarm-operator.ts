import { defineCard } from "../define.js";

// EDHREC rank 9064.
//
// Rulings:
//   [2025-07-25] An "artifact source" is any object with the card type artifact. This means you
//     could spend the mana from Steelswarm Operator's last ability to activate an ability of an
//     artifact you control or an artifact card in your hand or graveyard, for example.
//
// "Artifact sources" in any zone is `abilityOfAnyZone` (Secluded Courtyard's
// reading, rule 109.2a), and with no `spell` the {U}{U} can't cast anything.

const SPELL_TEXT = "{T}: Add {U}. Spend this mana only to cast an artifact spell.";
const ABILITY_TEXT = "{T}: Add {U}{U}. Spend this mana only to activate abilities of artifact sources.";

export default defineCard({
  name: "Steelswarm Operator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${SPELL_TEXT}\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: { spell: { type: "artifact" }, text: "Spend this mana only to cast an artifact spell." },
      },
      resolve: null,
      text: SPELL_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 2,
        spendOnly: {
          abilityOf: { type: "artifact" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to activate abilities of artifact sources.",
        },
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
