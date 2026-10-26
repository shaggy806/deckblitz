import { defineCard } from "../define.js";

// EDHREC rank 31961.

export default defineCard({
  name: "Valorous Charge",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "White creatures get +2/+0 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", colors: ["W"] },
    power: 2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
