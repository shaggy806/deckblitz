import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 22656.
//
// Path to Exile's "may search" for each player in turn order: each one's own
// choice, and one who declines doesn't search or shuffle.

const TEXT =
  "When this creature enters, each player may search their library for a basic land card, reveal it, put it into their hand, then shuffle.";

export default defineCard({
  name: "Jungle Wayfinder",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
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
