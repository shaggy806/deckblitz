import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts): a "Phyrexian card" is one with
// the Phyrexian subtype, as an "Angel card" is one with Angel.
const RULEBREAKER_TEXT =
  "Rulebreaker — A deck with this commander can have Phyrexian cards of any color identity and any basic land cards.";
const STATIC_TEXT = "Phyrexian creatures you control have menace and lifelink.";

export default defineCard({
  name: "Valko Indorian",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 4,
  text: `${RULEBREAKER_TEXT}\n${STATIC_TEXT}`,
  rulebreaker: {
    anyIdentity: [{ subtypes: ["Phyrexian"] }, { supertypes: ["basic"], types: ["land"] }],
  },
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Phyrexian", controlledBy: "you" } },
      grantKeywords: ["menace", "lifelink"],
      text: STATIC_TEXT,
    },
  ],
});
