import { defineCard } from "../define.js";

// EDHREC rank 28859.

const THIRD = "Follow the 3rd Rule — Gain control of target nonland permanent an opponent controls. That opponent draws three cards.";
const NINETY_EIGHTH =
  "Follow the 98th Rule — Target opponent gains control of target nonland permanent you control. If they do, you draw three cards.";

// "That opponent" is whoever the permanent was taken from (control changed
// first, so a permanent's "whenever an opponent draws" sees the draws under
// its new controller). "If they do" is whether control changed.
export default defineCard({
  name: "Rules of Acquisition",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Choose one —\n• ${THIRD}\n• ${NINETY_EIGHTH}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: THIRD,
        targets: ["nonland-permanent-an-opponent-controls"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 0, untilEndOfTurn: false },
            { kind: "draw", amount: 3, who: "players-who-lost-control-this-way" },
          ],
        },
      },
      {
        text: NINETY_EIGHTH,
        targets: ["opponent", { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 1, who: { target: 0 }, untilEndOfTurn: false },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "gained-control", atLeast: 1 },
              then: { kind: "draw", amount: 3 },
            },
          ],
        },
      },
    ],
  },
});
