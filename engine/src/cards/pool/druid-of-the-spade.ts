import { defineCard } from "../define.js";

// EDHREC rank 14410. "As long as you control a token": a token copy of this
// creature is a token you control, so the count includes it (`countsSelf`).
const TEXT = "As long as you control a token, this creature gets +2/+0 and has trample.";

export default defineCard({
  name: "Druid of the Spade",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rabbit", "Druid"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { token: true }, atLeast: 1, countsSelf: true },
      grantPt: [2, 0],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
