import { defineCard } from "../define.js";

// EDHREC rank 20977. The Lost Caverns of Ixalan.
//
// Visionary's Dance's look-and-choose; with one card left in the library it
// goes to the hand (the ruling — `min` 1 takes what there is).

const TEXT =
  "{1}, {T}, Sacrifice this artifact: Look at the top two cards of your library. Put one of those cards into your hand and the other into your graveyard.";

export default defineCard({
  name: "Orazca Puzzle-Door",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
