import { defineCard } from "../define.js";

// EDHREC rank 15198. Karumonix, the Rat King's look-and-choose, for artifact cards.

const TEXT =
  "Look at the top five cards of your library. You may reveal any number of artifact cards from among them and put the revealed cards into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Forging the Anchor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 5,
    filter: { type: "artifact" },
    destination: "hand",
    leftover: "bottom-random",
  },
});
