import { defineCard } from "../define.js";

// EDHREC rank 8110. Each player's own lands, counted as it resolves (the ruling).
export default defineCard({
  name: "Acidic Soil",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Acidic Soil deals damage to each player equal to the number of lands they control.",
  targets: [],
  effect: {
    kind: "damage",
    who: "each-player",
    amount: { countOf: { type: "land", controlledBy: "you" }, forEachPlayer: true },
  },
});
