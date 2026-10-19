import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 17437.
//
// "Land cards that each have a basic land type" is Boseiju, Who Endures's
// filter — a typed nonbasic counts, and the two needn't share a type (the
// rulings). Domain's X is read after those lands are on the battlefield (the
// ruling), then Thassa's Oracle's look: up to one back on top, the rest on
// the bottom at random.
const TEXT =
  "Domain — Search your library for up to two land cards that each have a basic land type, put them onto the battlefield tapped, then shuffle. Look at the top X cards of your library, where X is the number of basic land types among lands you control. Put up to one of them on top of your library and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Slimefoot's Survey",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { type: "land", subtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"] },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 2,
      },
      {
        kind: "look-and-choose",
        zone: "library",
        count: { basicLandTypes: "you" },
        min: 0,
        max: 1,
        destination: "library-top",
        leftover: "bottom-random",
      },
    ],
  },
});
