import { defineCard } from "../define.js";

const PUMP_TEXT = "As long as you control a token, this creature gets +2/+0.";

export default defineCard({
  name: "Briarbridge Tracker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\nWhen this creature enters, investigate. (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "When this creature enters, investigate.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      // A token copy of this creature is a token you control too.
      condition: { kind: "controls", filter: { token: true }, atLeast: 1, countsSelf: true },
      grantPt: [2, 0],
      text: PUMP_TEXT,
    },
  ],
});
