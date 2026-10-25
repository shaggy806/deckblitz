import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 16906.

const TEXT =
  "Whenever this creature or another Ally you control enters, you may have Ally creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Akoum Battlesinger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker", "Ally"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Ally creatures you control get +1/+0 until end of turn?",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", subtype: "Ally", controlledBy: "you" },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
