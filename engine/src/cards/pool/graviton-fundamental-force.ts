import { defineCard } from "../define.js";

// EDHREC rank 22943.
// A modal triggered ability: the mode, and its target, chosen as it goes on
// the stack (rule 700.2b — `announced`).

const DRAW_TEXT = "Whenever you draw your second card each turn, choose one —";
const FLYING_MODE = "Target creature gains flying until end of turn.";
const TAP_MODE = "Tap target creature.";

export default defineCard({
  name: "Graviton, Fundamental Force",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 3,
  text: `${DRAW_TEXT}\n• ${FLYING_MODE} (It can't be blocked except by creatures with flying or reach.)\n• ${TAP_MODE}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: FLYING_MODE,
            targets: ["creature"],
            effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          },
          { text: TAP_MODE, targets: ["creature"], effect: { kind: "tap", target: 0 } },
        ],
      },
      resolve: null,
      text: `${DRAW_TEXT} ${FLYING_MODE} ${TAP_MODE}`,
    },
  ],
});
