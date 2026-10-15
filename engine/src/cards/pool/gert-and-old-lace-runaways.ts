import { defineCard } from "../define.js";

// EDHREC rank 24748.
// Formidable Speaker's "you may discard a card. If you do, search", for a
// basic land.

const ETB_TEXT =
  "When Gert and Old Lace enter, you may discard a card. If you do, search your library for a basic land card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Gert and Old Lace, Runaways",
  manaCost: "{2}{R/G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Dinosaur", "Hero"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player they're attacking.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to search your library for a basic land card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "search-library",
                filter: { supertype: "basic", type: "land" },
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
      text: ETB_TEXT,
    },
  ],
});
