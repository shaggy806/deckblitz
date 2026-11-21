import { defineCard } from "../define.js";

// EDHREC rank 18199.
//
// The thirteen are revealed (rule 701.20a) and one creature card among them
// is picked by the game at random (`atRandom`, from its seeded randomness):
// nobody chooses it. With no creature card among them, nothing enters. The
// rest go to the bottom in a random order.

const TEXT =
  "When this artifact is put into a graveyard from the battlefield, reveal the top thirteen cards of your library. " +
  "Put a random creature card from among them onto the battlefield. Put the rest on the bottom of your library in a " +
  "random order.";

export default defineCard({
  name: "Getaway Barrel",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 13,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "bottom-random",
        atRandom: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
