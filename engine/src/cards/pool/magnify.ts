import { defineCard } from "../define.js";

export default defineCard({
  name: "Magnify",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "All creatures get +1/+1 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
});
