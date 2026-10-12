import { defineCard } from "../define.js";

export default defineCard({
  name: "Marsh Gas",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "All creatures get -2/-0 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: -2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
