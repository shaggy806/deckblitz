import { defineCard } from "../define.js";

// The Hobbit (HOB). EDHREC rank 7442.
//
// The cards not taken stay where they are, and the library is then shuffled
// with them in it.

const TEXT =
  "Look at the top twenty cards of your library, put any number of land cards from among them onto the battlefield tapped, then shuffle. You gain 8 life.";

export default defineCard({
  name: "Through the Forest Gate",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 20,
        min: 0,
        max: 20,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
      },
      { kind: "shuffle-library" },
      { kind: "gain-life", amount: 8 },
    ],
  },
});
