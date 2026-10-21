import { defineCard } from "../define.js";

// EDHREC rank 30977.

export default defineCard({
  name: "Piety",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Blocking creatures get +0/+3 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", blocking: true },
    power: 0,
    toughness: 3,
    duration: "end-of-turn",
  },
});
