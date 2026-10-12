import { defineCard } from "../define.js";

export default defineCard({
  name: "Seeker's Folly",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Target opponent discards two cards.\n• Creatures your opponents control get -1/-1 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target opponent discards two cards.",
        targets: ["opponent"],
        effect: { kind: "discard", target: 0, amount: 2 },
      },
      {
        text: "Creatures your opponents control get -1/-1 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "opponent" },
          power: -1,
          toughness: -1,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
