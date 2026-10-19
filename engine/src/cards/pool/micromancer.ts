import { defineCard } from "../define.js";

// EDHREC rank 9763.
//
// Rulings:
//   [2022-09-09] If a card in a player's library has {X} in its mana cost, X is considered to be
//     0.
const TEXT =
  "When this creature enters, you may search your library for an instant or sorcery card with mana value 1, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Micromancer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an instant or sorcery card with mana value 1?",
        effect: {
          kind: "search-library",
          filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "eq", n: 1 } },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
