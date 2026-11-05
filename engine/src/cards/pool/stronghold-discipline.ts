import { defineCard } from "../define.js";

// EDHREC rank 23384.
export default defineCard({
  name: "Stronghold Discipline",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player loses 1 life for each creature they control.",
  targets: [],
  effect: {
    kind: "lose-life",
    who: "each-player",
    amount: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
  },
});
