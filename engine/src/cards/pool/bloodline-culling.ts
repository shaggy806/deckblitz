import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodline Culling",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Target creature gets -5/-5 until end of turn.\n• Creature tokens get -2/-2 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gets -5/-5 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
      },
      {
        text: "Creature tokens get -2/-2 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", token: true },
          power: -2,
          toughness: -2,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
