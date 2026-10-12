import { defineCard } from "../define.js";

export default defineCard({
  name: "Rollick of Abandon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "All creatures get +2/-2 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: 2,
    toughness: -2,
    duration: "end-of-turn",
  },
});
