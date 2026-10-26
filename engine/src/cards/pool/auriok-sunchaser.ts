import { defineCard } from "../define.js";

// EDHREC rank 27585.

const TEXT = "Metalcraft — As long as you control three or more artifacts, this creature gets +2/+2 and has flying.";

export default defineCard({
  name: "Auriok Sunchaser",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    { affects: { scope: "self" }, condition: { kind: "metalcraft" }, grantPt: [2, 2], grantKeywords: ["flying"], text: TEXT },
  ],
});
