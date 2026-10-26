import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 25278.
//
// "Another": a static's `controls` condition already leaves its own
// permanent out of the count.

const TEXT = "This creature gets +1/+1 as long as you control another white creature.";

export default defineCard({
  name: "Ballynock Cohort",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["W"] }, atLeast: 1 },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
