import { defineCard } from "../define.js";

const TEXT = "This creature has vigilance as long as you control another Dinosaur.";

export default defineCard({
  name: "Sun-Crested Pterodon",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      // A static's `controls` condition leaves its own permanent out: "another".
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 },
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
