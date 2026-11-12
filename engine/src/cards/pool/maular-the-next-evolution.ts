import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts).
const RULEBREAKER_TEXT =
  "Rulebreaker — A deck with this commander can have creature cards with mana value 7 or greater of any color identity and any basic land cards.";
const ATTACK_TEXT =
  "Whenever a creature you control with mana value 7 or greater attacks, double its power and toughness until end of turn.";

export default defineCard({
  name: "Maular, the Next Evolution",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Mutant"],
  power: 10,
  toughness: 10,
  text: `${RULEBREAKER_TEXT}\n${ATTACK_TEXT}`,
  rulebreaker: {
    anyIdentity: [
      { types: ["creature"], minManaValue: 7 },
      { supertypes: ["basic"], types: ["land"] },
    ],
  },
  triggered: [
    {
      trigger: {
        on: "attacks",
        who: "you-control",
        filter: { type: "creature", manaValue: { op: "gte", n: 7 } },
      },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { powerOf: "trigger-object", doubling: true },
        toughness: { toughnessOf: "trigger-object", doubling: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
