import { defineCard } from "../define.js";

// EDHREC rank 28421.

export default defineCard({
  name: "Army of Allah",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
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
