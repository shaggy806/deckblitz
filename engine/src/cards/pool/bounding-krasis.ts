import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 18003. Sewer-veillance Cam's "you may tap or
// untap target creature": the target chosen as the trigger goes on the
// stack, tap, untap or neither chosen as it resolves.
const ETB_TEXT = "When this creature enters, you may tap or untap target creature.";

export default defineCard({
  name: "Bounding Krasis",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Fish", "Lizard"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target creature.", effect: { kind: "tap", target: 0 } },
          { text: "Untap target creature.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
