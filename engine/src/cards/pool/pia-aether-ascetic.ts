import { defineCard } from "../define.js";

// EDHREC rank 11412.

const ENTER_TEXT =
  "When Pia enters, you may discard a card. If you do, search your library for an enchantment card, reveal it, put it into your hand, then shuffle.";

// Formidable Speaker's shape: the search happens only if a card was
// actually discarded.
export default defineCard({
  name: "Pia, Aether Ascetic",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to search your library for an enchantment card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "search-library",
                filter: { type: "enchantment" },
                destination: "hand",
                min: 0,
                max: 1,
                reveal: true,
              },
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
