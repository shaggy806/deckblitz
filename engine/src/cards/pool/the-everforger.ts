import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts); in play the card is its trigger.
const RULEBREAKER_TEXT =
  "Rulebreaker — A deck with this commander can have artifact creature and Equipment cards of any color identity and any basic land cards.";
const COPY_TEXT =
  "Whenever you cast an artifact creature or Equipment spell, you may copy that spell. Do this only once each turn. (The copy becomes a token.)";

export default defineCard({
  name: "The Everforger",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 5,
  text: `${RULEBREAKER_TEXT}\n${COPY_TEXT}`,
  rulebreaker: {
    anyIdentity: [
      { types: ["artifact", "creature"] },
      { subtypes: ["Equipment"] },
      { supertypes: ["basic"], types: ["land"] },
    ],
  },
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ types: ["artifact", "creature"] }, { subtype: "Equipment" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell?",
        oncePerTurn: true,
        effect: { kind: "copy-spell", target: "trigger-spell" },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
