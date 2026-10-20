import { defineCard } from "../define.js";

// EDHREC rank 17542. A Lesson — an ordinary sorcery here.
export default defineCard({
  name: "Basic Conjuration",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Look at the top six cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. You gain 3 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
