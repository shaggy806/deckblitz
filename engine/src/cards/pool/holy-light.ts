import { defineCard } from "../define.js";

export default defineCard({
  name: "Holy Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Nonwhite creatures get -1/-1 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", notColors: ["W"] },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
});
