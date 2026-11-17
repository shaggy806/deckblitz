import { defineCard } from "../define.js";

// The back face of Twists and Turns (EDHREC rank 12154). The look is Brightwood Tracker's.

const LOOK_TEXT =
  "{3}{G}, {T}: Look at the top four cards of your library. You may reveal a creature card from among them and put that card into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Mycoid Maze",
  art: "https://cards.scryfall.io/art_crop/back/3/c/3cdf691e-96a5-45c7-9b94-6f04af81c8e4.jpg",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text: `(Transforms from Twists and Turns.)\n{T}: Add {G}.\n${LOOK_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: "{3}{G}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
  faces: ["Twists and Turns", "Mycoid Maze"],
  transform: true,
});
