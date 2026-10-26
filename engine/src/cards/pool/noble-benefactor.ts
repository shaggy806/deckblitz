import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 12322.
//
// Rulings:
//   [2008-04-01] The player whose turn it is searches their library (or chooses not to), then each
//     other player in turn order does the same. Then the player whose turn it is shuffles their
//     library (if that player searched), then each other player in turn order does the same.
//
// Each player is asked in turn from the active player (`each-player-may`); a
// player who declines doesn't search, so doesn't shuffle. "A card" has no
// stated quality, so one is found while the library has one (rule 701.23d).

const TEXT =
  "When this creature dies, each player may search their library for a card and put that card into their hand. Then each player who searched their library this way shuffles.";

export default defineCard({
  name: "Noble Benefactor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Search your library for a card and put it into your hand?",
        effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
