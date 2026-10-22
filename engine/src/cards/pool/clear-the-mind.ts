import { defineCard } from "../define.js";

export default defineCard({
  name: "Clear the Mind",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player shuffles their graveyard into their library.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
