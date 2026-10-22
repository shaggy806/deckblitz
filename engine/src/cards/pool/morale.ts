import { defineCard } from "../define.js";

export default defineCard({
  name: "Morale",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Attacking creatures get +1/+1 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", attacking: true },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
});
