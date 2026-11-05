import { defineCard } from "../define.js";

// EDHREC rank 2633. Jarad's Orders' shape, but "two cards" with no quality and
// no "up to": both are found if the library holds them.

export default defineCard({
  name: "Final Parting",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search your library for two cards. Put one into your hand and the other into your graveyard. Then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: {},
    destination: "graveyard",
    min: 2,
    max: 2,
    instead: { destination: "hand", pick: "one" },
  },
});
