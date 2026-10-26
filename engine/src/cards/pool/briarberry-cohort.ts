import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 26252.
//
// "Another blue creature": a static's `controls` scan skips its own source
// (Court Homunculus's shape).

const TEXT = "This creature gets +1/+1 as long as you control another blue creature.";

export default defineCard({
  name: "Briarberry Cohort",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["U"] }, atLeast: 1 },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
