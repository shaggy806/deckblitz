import { defineCard } from "../define.js";

// EDHREC rank 7209. Zendikar Rising.
//
// Sandworm's shape: the search follows the destroy whether or not the land was
// destroyed (an indestructible one — the ruling), by the land's controller as
// it last existed; an illegal target means none of it happens, the draw
// included (the ruling — the spell doesn't resolve).

const TEXT =
  "Destroy target land. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.\nDraw a card.";

export default defineCard({
  name: "Cleansing Wildfire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
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
          enterTapped: true,
          min: 0,
          max: 1,
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
