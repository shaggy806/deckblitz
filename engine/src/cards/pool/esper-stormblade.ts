import { defineCard } from "../define.js";

export default defineCard({
  name: "Esper Stormblade",
  manaCost: "{W/B}{U}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 1,
  text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has flying.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { multicolored: true }, atLeast: 1, excludeSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has flying.",
    },
  ],
});
