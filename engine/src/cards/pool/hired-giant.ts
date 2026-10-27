import { defineCard } from "../define.js";

// EDHREC rank 17608.
//
// "Each other player" is every opponent: the engine's games have no teams.

const ENTER_TEXT =
  "When this creature enters, each other player may search their library for a land card and put that card onto the battlefield. Then each player who searched their library this way shuffles.";

export default defineCard({
  name: "Hired Giant",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Search your library for a land card and put it onto the battlefield?",
        effect: {
          kind: "search-library",
          filter: { type: "land" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
