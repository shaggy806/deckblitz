import { defineCard } from "../define.js";

// EDHREC rank 4987. Finding "a card" must find one; the find stays in the
// library through the shuffle, then goes third from the top (the bottom of a
// library with fewer than three cards, the ruling).
export default defineCard({
  name: "Long-Term Plans",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Search your library for a card, then shuffle and put that card third from the top.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: {},
    destination: "stay",
    min: 1,
    max: 1,
    then: { kind: "put-on-library", target: 0, position: { fromTop: 3 } },
  },
});
