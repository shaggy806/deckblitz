import { defineCard } from "../define.js";

// "That hasn't been chosen" is these Beads' own memory, over their time on
// the battlefield: Prime Bead exiles and returns them, a new object (rule
// 400.7) with no memory of its modes, so every mode is open again. Once all
// three have been chosen, the trigger has no mode to choose and is removed
// (rule 700.2b). The mode is chosen as the trigger goes on the stack (603.3c).
const TRIGGER_TEXT = "At the beginning of your end step, choose one that hasn't been chosen —";
const AV_MODE = "AV Bead — Draw a card.";
const COMMUNICATION_MODE = "Communication Bead — Create two 1/1 white Soldier creature tokens.";
const PRIME_MODE =
  "Prime Bead — You gain 3 life. Exile this artifact, then return it to the battlefield under its owner's control.";

export default defineCard({
  name: "Kimoyo Beads",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TRIGGER_TEXT}\n• ${AV_MODE}\n• ${COMMUNICATION_MODE}\n• ${PRIME_MODE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: AV_MODE, effect: { kind: "draw", amount: 1 } },
          { text: COMMUNICATION_MODE, effect: { kind: "create-token", token: "Soldier Token", count: 2 } },
          {
            text: PRIME_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: 3 },
                { kind: "flicker", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${AV_MODE} ${COMMUNICATION_MODE} ${PRIME_MODE}`,
    },
  ],
});
