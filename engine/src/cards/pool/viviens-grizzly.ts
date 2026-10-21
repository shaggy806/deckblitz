import { defineCard } from "../define.js";

const TEXT =
  "{3}{G}: Look at the top card of your library. If it's a creature or planeswalker card, you may reveal it and put it into your hand. If you don't put the card into your hand, put it on the bottom of your library.";

// A card not taken — not a creature or planeswalker, or declined — goes to
// the bottom either way (the ruling): the one leftover card's "random order".
export default defineCard({
  name: "Vivien's Grizzly",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Spirit"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
