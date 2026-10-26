import { defineCard } from "../define.js";

// EDHREC rank 19903. Return to Ravnica.
//
// Rulings:
//   The number of creatures you control is counted only when Chorus of Might resolves.

const COUNT = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Chorus of Might",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Until end of turn, target creature gets +1/+1 for each creature you control and gains trample.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: COUNT, toughness: COUNT, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
