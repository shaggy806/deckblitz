import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, you may discard a card. If you do, search your library for a land or battle card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Truga Cliffcharger",
  art: "https://cards.scryfall.io/art_crop/back/b/3/b3e0fc49-f765-4bd1-a2b9-23e703388b50.jpg",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Rhino"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to search for a land or battle card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "search-library",
                filter: { typesAnyOf: ["land", "battle"] },
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
  faces: ["Invasion of Ergamon", "Truga Cliffcharger"],
  transform: true,
});
