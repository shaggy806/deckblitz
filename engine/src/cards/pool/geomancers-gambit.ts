import { defineCard } from "../define.js";

// EDHREC rank 12942.
//
// Rulings:
//   [2019-06-14] If the target land is an illegal target by the time Geomancer's Gambit tries to
//     resolve, the spell doesn't resolve. Its controller doesn't search for a basic land card and
//     you don't draw a card. If the target is legal but not destroyed (most likely because it has
//     indestructible), its controller does search and you do draw.
//
// Ghost Quarter's shape: "its controller" is whoever controlled the land as it
// left (rule 608.2h), and the search is theirs to decline.

export default defineCard({
  name: "Geomancer's Gambit",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land. Its controller may search their library for a basic land card, put it onto the battlefield, then shuffle.\nDraw a card.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
