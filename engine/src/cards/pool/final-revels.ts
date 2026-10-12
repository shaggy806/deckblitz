import { defineCard } from "../define.js";

export default defineCard({
  name: "Final Revels",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• All creatures get +2/+0 until end of turn.\n• All creatures get -0/-2 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "All creatures get +2/+0 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature" },
          power: 2,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        text: "All creatures get -0/-2 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature" },
          power: 0,
          toughness: -2,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
