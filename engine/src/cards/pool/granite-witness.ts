import { defineCard } from "../define.js";

// Disguise {W/U}{W/U} (rule 702.168). "You may tap or untap target creature":
// the target is chosen as the trigger goes on the stack; tap, untap or
// neither is chosen as it resolves (Retreat to Coralhelm's shape).

const FACE_UP_TEXT = "When this creature is turned face up, you may tap or untap target creature.";

export default defineCard({
  name: "Granite Witness",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle", "Detective"],
  power: 3,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\nDisguise {W/U}{W/U} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{W/U}{W/U}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
