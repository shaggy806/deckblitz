import { defineCard } from "../define.js";

export default defineCard({
  name: "Bant Sureblade",
  manaCost: "{G/U}{W}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has first strike.",
  static: [
    {
      // A static's `controls` condition leaves its own permanent out: "another".
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { multicolored: true }, atLeast: 1 },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has first strike.",
    },
  ],
});
