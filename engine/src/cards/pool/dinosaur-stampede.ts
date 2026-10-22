import { defineCard } from "../define.js";

// EDHREC rank 16471.

export default defineCard({
  name: "Dinosaur Stampede",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Attacking creatures get +2/+0 until end of turn. Dinosaurs you control gain trample until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { subtype: "Dinosaur", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
