import { defineCard } from "../define.js";

const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, choose one —";
const PUMP_MODE = "Target creature gets +2/+0 until end of turn.";
const BLOCK_MODE = "Target creature can't block this turn.";

export default defineCard({
  name: "Retreat to Valakut",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${LANDFALL_TEXT}\n• ${PUMP_MODE}\n• ${BLOCK_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: PUMP_MODE,
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          },
          {
            text: BLOCK_MODE,
            targets: ["creature"],
            effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          },
        ],
      },
      resolve: null,
      text: `${LANDFALL_TEXT} ${PUMP_MODE} ${BLOCK_MODE}`,
    },
  ],
});
