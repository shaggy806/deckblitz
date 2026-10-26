import { defineCard } from "../define.js";

// EDHREC rank 17902.

export default defineCard({
  name: "Apocalypse",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile all permanents. You discard your hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: {} },
      { kind: "discard-hand", who: "you" },
    ],
  },
});
