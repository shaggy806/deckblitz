import { defineCard } from "../define.js";

// Top-500 commander. The first trigger's "those permanents" is the spell's
// targets among your other permanents, as they stand now (`inSet`), so one
// that has left isn't chosen (the ruling) and with none left nothing is made;
// you choose as the token is created. The discard trigger fires only for a
// discard an opponent's spell or ability caused.

const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, if it targets one or more other permanents you control, create a token that's a copy of one of those permanents.";
const DISCARD_TEXT =
  "When a spell or ability an opponent controls causes you to discard this card, create a token that's a copy of target permanent.";

export default defineCard({
  name: "Orvar, the All-Form",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  keywords: ["changeling"],
  text: `Changeling\n${CAST_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { controlledBy: "you" }, source: false } },
      },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { inSet: { targetsOf: "trigger-object" }, controlledBy: "you" },
        upTo: 1,
        min: 1,
        exceptSource: true,
        prompt: "Create a token that's a copy of one of those permanents.",
        then: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: ["permanent"],
      effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
