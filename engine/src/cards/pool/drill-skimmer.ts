import { defineCard } from "../define.js";

// EDHREC rank 27430.

const SHROUD_TEXT = "This creature has shroud as long as you control another artifact creature.";

export default defineCard({
  name: "Drill-Skimmer",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${SHROUD_TEXT} (It can't be the target of spells or abilities.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { types: ["artifact", "creature"] }, atLeast: 1, excludeSelf: true },
      grantKeywords: ["shroud"],
      text: SHROUD_TEXT,
    },
  ],
});
