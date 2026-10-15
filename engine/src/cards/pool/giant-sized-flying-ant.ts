import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this creature enters, choose one —\n• Tap target nonland permanent.\n• Untap target nonland permanent.";

export default defineCard({
  name: "Giant-Sized Flying Ant",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // A modal triggered ability's mode is chosen as it's put on the stack,
      // its target with it (rule 700.2b).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Tap target nonland permanent.", targets: ["nonland-permanent"], effect: { kind: "tap", target: 0 } },
          { text: "Untap target nonland permanent.", targets: ["nonland-permanent"], effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
