import { defineCard } from "../define.js";

// EDHREC rank 29872. "Another": a static's `controls` scan skips its own
// source (Court Homunculus's shape).

const TEXT = "This creature gets +1/+1 as long as you control another green creature.";

export default defineCard({
  name: "Crabapple Cohort",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["G"] }, atLeast: 1 },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
