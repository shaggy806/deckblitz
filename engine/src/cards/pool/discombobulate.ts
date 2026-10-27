import { defineCard } from "../define.js";

// EDHREC rank 22125.

export default defineCard({
  name: "Discombobulate",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Look at the top four cards of your library, then put them back in any order.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 4,
        max: 4,
        destination: "library-top",
        leftover: "stay",
      },
    ],
  },
});
