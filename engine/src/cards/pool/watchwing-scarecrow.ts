import { defineCard } from "../define.js";

// EDHREC rank 19480.

const VIGILANCE_TEXT = "This creature has vigilance as long as you control a white creature.";
const FLYING_TEXT = "This creature has flying as long as you control a blue creature.";

export default defineCard({
  name: "Watchwing Scarecrow",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 4,
  text: `${VIGILANCE_TEXT}\n${FLYING_TEXT}`,
  static: [
    {
      // `countsSelf`: a Scarecrow made white or blue counts itself.
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["W"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["U"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
});
