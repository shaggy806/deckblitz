import { defineCard } from "../define.js";

// EDHREC rank 22753.

const MINUS_X = { product: [{ countOf: { types: ["artifact", "creature"], controlledBy: "you" } }, -1] } as const;

export default defineCard({
  name: "Battle of Wolf 359",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All nonartifact creatures get -X/-X until end of turn, where X is the number of artifact creatures you control.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", notTypes: ["artifact"] },
    power: MINUS_X,
    toughness: MINUS_X,
    duration: "end-of-turn",
  },
});
