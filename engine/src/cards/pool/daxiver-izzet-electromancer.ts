import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts — Valko Indorian): with Daxiver
// as commander, instant and sorcery cards of any color identity. The mana is
// one of any colour, restricted to instant and sorcery spells (Resonating
// Lute's grant).

const RULEBREAKER_TEXT =
  "Rulebreaker — If Daxiver, Izzet Electromancer is your Commander, you may include instant and sorcery cards of any color in your deck regardless of color identity.";
const MANA_TEXT = "{T}: Add one mana of any color. Spend this mana only to cast instant and sorcery spells.";

export default defineCard({
  name: "Daxiver, Izzet Electromancer",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 2,
  toughness: 4,
  text: `${RULEBREAKER_TEXT}\n${MANA_TEXT}`,
  rulebreaker: {
    anyIdentity: [{ types: ["instant"] }, { types: ["sorcery"] }],
  },
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast instant and sorcery spells.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
