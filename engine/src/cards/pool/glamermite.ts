import { defineCard } from "../define.js";

// EDHREC rank 13147.

const ETB_TEXT = "When this creature enters, choose one —";
const TAP_MODE = "Tap target creature.";
const UNTAP_MODE = "Untap target creature.";

export default defineCard({
  name: "Glamermite",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ETB_TEXT}\n• ${TAP_MODE}\n• ${UNTAP_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: TAP_MODE, targets: ["creature"], effect: { kind: "tap", target: 0 } },
          { text: UNTAP_MODE, targets: ["creature"], effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${TAP_MODE} ${UNTAP_MODE}`,
    },
  ],
});
