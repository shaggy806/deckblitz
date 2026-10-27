import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 31101. Juniper Order Advocate's untapped
// condition on a self static.

const TEXT = "As long as this creature is untapped, it gets +0/+2.";

export default defineCard({
  name: "Castle Raptors",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      grantPt: [0, 2],
      text: TEXT,
    },
  ],
});
