import { defineCard } from "../define.js";

// Each player decides in turn order whether to discard; then each who did
// may search, as their own search (a nested `each-player-may` of that
// player, since a search they may decline is theirs to decline).

const TEXT =
  "When this creature enters, each player may discard a card. Each player who discarded a card this way may search their library for a basic land card, reveal it, put it into their hand, then shuffle.";

export default defineCard({
  name: "Borderland Explorer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ discard: 1, text: "Discard a card" }],
        ifDid: {
          kind: "each-player-may",
          who: "that-player",
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
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
