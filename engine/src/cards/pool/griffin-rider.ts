import { defineCard } from "../define.js";

// EDHREC rank 26150.

const TEXT = "As long as you control a Griffin creature, this creature gets +3/+3 and has flying.";

export default defineCard({
  name: "Griffin Rider",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", subtype: "Griffin" }, atLeast: 1 },
      grantPt: [3, 3],
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
