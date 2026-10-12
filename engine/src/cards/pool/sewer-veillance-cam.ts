import { defineCard } from "../define.js";

// EDHREC rank 9072.
//
// "Enters or leaves the battlefield" is two triggers (Cryogen Relic's). "You
// may tap or untap" is Retreat to Coralhelm's choice of tap, untap or
// neither, made as it resolves.
const TAP_TEXT = "When this artifact enters or leaves the battlefield, you may tap or untap target creature.";
const DRAW_TEXT = "{3}{U}, Sacrifice this artifact: Draw two cards.";
const tapOrUntap = {
  kind: "modal",
  minModes: 0,
  maxModes: 1,
  modes: [
    { text: "Tap it", effect: { kind: "tap", target: 0 } },
    { text: "Untap it", effect: { kind: "untap", target: 0 } },
  ],
} as const;

export default defineCard({
  name: "Sewer-veillance Cam",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash\n${TAP_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: tapOrUntap,
      resolve: null,
      text: TAP_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["creature"],
      effect: tapOrUntap,
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
