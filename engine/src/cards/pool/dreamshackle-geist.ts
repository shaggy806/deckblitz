import { defineCard } from "../define.js";

// Innistrad: Crimson Vow. "Choose up to one": no mode at all is an
// answer (`minModes: 0`), and the ability is then removed from the stack.

const TRIGGER_TEXT = "At the beginning of combat on your turn, choose up to one —";
const TAP_MODE = "Tap target creature.";
const FREEZE_MODE = "Target creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Dreamshackle Geist",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n• ${TAP_MODE}\n• ${FREEZE_MODE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: TAP_MODE, targets: ["creature"], effect: { kind: "tap", target: 0 } },
          {
            text: FREEZE_MODE,
            targets: ["creature"],
            effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT}\n• ${TAP_MODE}\n• ${FREEZE_MODE}`,
    },
  ],
});
