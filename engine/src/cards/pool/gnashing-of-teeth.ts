import { defineCard } from "../define.js";

const MODE_ONE = "Target creature gets -5/-5 until end of turn. If that creature would die this turn, exile it instead.";
const MODE_TWO = "Creatures target player controls get -1/-1 until end of turn.";

export default defineCard({
  name: "Gnashing of Teeth",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${MODE_ONE}\n• ${MODE_TWO}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MODE_ONE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
            { kind: "exile-if-dies-this-turn", target: 0 },
          ],
        },
      },
      {
        text: MODE_TWO,
        targets: ["player"],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          power: -1,
          toughness: -1,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
