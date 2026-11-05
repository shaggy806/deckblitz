import { defineCard } from "../define.js";

// EDHREC rank 17082.

export default defineCard({
  name: "Fork in the Road",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to two basic land cards and reveal them. Put one into your hand and the other into your graveyard. Then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "graveyard",
    min: 0,
    max: 2,
    reveal: true,
    instead: { destination: "hand", pick: "one" },
  },
});
