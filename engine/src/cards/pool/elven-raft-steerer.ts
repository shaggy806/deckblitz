import { defineCard } from "../define.js";

// EDHREC rank 11315.
//
// Rulings:
//   [2026-06-29] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.
//
// A modal triggered ability announces its mode as it goes on the stack, with
// that mode's target (Retreat to Kazandu's shape).
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, choose one —";
const TAP_MODE = "Tap target creature an opponent controls.";
const UNTAP_MODE = "Untap target creature you control.";

export default defineCard({
  name: "Elven Raft-Steerer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Pilot"],
  power: 3,
  toughness: 2,
  text: `${LANDFALL_TEXT}\n• ${TAP_MODE}\n• ${UNTAP_MODE}`,
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
          { text: TAP_MODE, targets: ["creature-an-opponent-controls"], effect: { kind: "tap", target: 0 } },
          { text: UNTAP_MODE, targets: ["creature-you-control"], effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: `${LANDFALL_TEXT} ${TAP_MODE} ${UNTAP_MODE}`,
    },
  ],
});
