import { defineCard } from "../define.js";

// EDHREC rank 3180. A search for cards with a stated quality may find fewer
// (rule 701.19b), so up to four.

export default defineCard({
  name: "Planar Engineering",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Sacrifice two lands. Search your library for four basic land cards, put them onto the battlefield tapped, then shuffle.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 2 },
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 4,
      },
    ],
  },
});
