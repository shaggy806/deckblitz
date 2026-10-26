import { defineCard } from "../define.js";

export default defineCard({
  name: "Jund Hackblade",
  manaCost: "{B/G}{R}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 2,
  toughness: 1,
  text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has haste.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { multicolored: true }, atLeast: 1, excludeSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["haste"],
      text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has haste.",
    },
  ],
});
