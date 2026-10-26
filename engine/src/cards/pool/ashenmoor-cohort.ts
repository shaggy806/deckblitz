import { defineCard } from "../define.js";

// EDHREC rank 31682. "Another": a static's `controls` scan skips its own
// source (Court Homunculus's shape).

const TEXT = "This creature gets +1/+1 as long as you control another black creature.";

export default defineCard({
  name: "Ashenmoor Cohort",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["B"] }, atLeast: 1 },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
