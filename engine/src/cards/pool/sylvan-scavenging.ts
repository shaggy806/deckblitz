import { defineCard } from "../define.js";

// EDHREC rank 6925.

const TRIGGER_TEXT = "At the beginning of your end step, choose one —";
const COUNTER_MODE = "Put a +1/+1 counter on target creature you control.";
const RACCOON_MODE =
  "Create a 3/3 green Raccoon creature token if you control a creature with power 4 or greater.";

// The mode is chosen as the ability goes on the stack (rule 700.2b); the
// Raccoon's "if you control …" is checked only as it resolves.
export default defineCard({
  name: "Sylvan Scavenging",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n• ${COUNTER_MODE}\n• ${RACCOON_MODE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COUNTER_MODE,
            targets: ["creature-you-control"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: RACCOON_MODE,
            effect: {
              kind: "conditional",
              condition: {
                kind: "controls",
                filter: { type: "creature", power: { op: "gte", n: 4 } },
                atLeast: 1,
              },
              then: { kind: "create-token", token: "Raccoon Token", count: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${COUNTER_MODE} ${RACCOON_MODE}`,
    },
  ],
});
