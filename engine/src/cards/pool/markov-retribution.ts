import { defineCard } from "../define.js";

const MODE_1 = "Creatures you control get +1/+0 until end of turn.";
const MODE_2 = "Target Vampire you control deals damage equal to its power to another target creature.";

export default defineCard({
  name: "Markov Retribution",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one or both —\n• ${MODE_1}\n• ${MODE_2}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: MODE_1,
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        text: MODE_2,
        targets: [
          { kind: "permanent", whose: "you", filter: { subtype: "Vampire" } },
          { kind: "other", of: "creature", than: { slot: 0 } },
        ],
        effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      },
    ],
  },
});
