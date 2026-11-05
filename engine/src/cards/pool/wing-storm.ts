import { defineCard } from "../define.js";

// EDHREC rank 15788.

export default defineCard({
  name: "Wing Storm",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Wing Storm deals damage to each player equal to twice the number of creatures that player controls with flying.",
  effect: {
    kind: "damage",
    who: "each-player",
    amount: { countOf: { type: "creature", keyword: "flying", controlledBy: "you" }, forEachPlayer: true, times: 2 },
  },
});
