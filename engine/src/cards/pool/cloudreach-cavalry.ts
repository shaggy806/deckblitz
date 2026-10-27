import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 30490.

export default defineCard({
  name: "Cloudreach Cavalry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "As long as you control a Bird, this creature gets +2/+2 and has flying.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Bird" }, atLeast: 1, countsSelf: true },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "As long as you control a Bird, this creature gets +2/+2 and has flying.",
    },
  ],
});
