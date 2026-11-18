import { defineCard } from "../define.js";

// "Exactly two colors" is `colorCount: 2`: the spell as it's cast, and each
// card among the six as it is in the library.

const CAST_TEXT =
  "Whenever you cast a spell that's exactly two colors, look at the top six cards of your library. You may reveal a card that's exactly two colors from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Guildpact Paragon",
  art: "https://cards.scryfall.io/art_crop/back/7/3/73f8fc4f-2f36-4932-8d04-3c2651c116dc.jpg",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 5,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colorCount: 2 } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { colorCount: 2 },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  faces: ["Invasion of Ravnica", "Guildpact Paragon"],
  transform: true,
});
