import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, search your library for up to X Plains cards, where X is the number of players who control more lands than you. Reveal those cards, put them into your hand, then shuffle.";

// X counts each player you control fewer lands than — you never control more
// than yourself — read as the trigger resolves. Plains *cards*: anything with
// the subtype, not only basics.
export default defineCard({
  name: "Oreskos Explorer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Scout"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Plains" },
        destination: "hand",
        min: 0,
        max: {
          countPlayers: "each-player",
          where: { kind: "player-compare", stat: { controls: { type: "land" } }, compare: "fewer", than: "that-player" },
        },
        reveal: true,
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
