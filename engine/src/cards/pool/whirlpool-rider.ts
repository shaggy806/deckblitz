import { defineCard } from "../define.js";

// Apocalypse (APC). Every card in the hand goes into the library, which is
// shuffled, then that many are drawn — none when the hand was empty.
const TEXT =
  "When this creature enters, shuffle the cards from your hand into your library, then draw that many cards.";

export default defineCard({
  name: "Whirlpool Rider",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you", zones: ["hand"], drawThatMany: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
