import { defineCard } from "../define.js";

// Teenage Mutant Ninja Turtles (TMT). "If you don't put a card into your
// hand this way" is the `"put-into-hand"` this-way kind with `atMost: 0`:
// declining the search and finding no Food both make the token. A Food card
// is one with the Food artifact subtype.

const TEXT =
  "When this creature enters, you may search your library for a Food card, reveal it, put it into your hand, then shuffle. If you don't put a card into your hand this way, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Courier of Comestibles",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "may",
            prompt: "Search your library for a Food card?",
            effect: {
              kind: "search-library",
              filter: { subtype: "Food" },
              destination: "hand",
              reveal: true,
              min: 0,
              max: 1,
            },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
            then: { kind: "create-token", token: "Food Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
