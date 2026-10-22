import { defineCard } from "../define.js";

// EDHREC rank 20482. Ixalan. Each opponent is asked in turn, and the search
// is that player's own (Erode's "its controller may search …").

export default defineCard({
  name: "Old-Growth Dryads",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, each opponent may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, each opponent may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    },
  ],
});
