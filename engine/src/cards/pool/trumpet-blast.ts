import { defineCard } from "../define.js";

export default defineCard({
  name: "Trumpet Blast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Attacking creatures get +2/+0 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", attacking: true },
    power: 2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
