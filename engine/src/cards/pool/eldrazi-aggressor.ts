import { defineCard } from "../define.js";

// EDHREC rank 27603.
//
// A static's `controls` condition leaves its own permanent out, so this is
// "another colorless creature".
const TEXT = "This creature has haste as long as you control another colorless creature.";

export default defineCard({
  name: "Eldrazi Aggressor",
  manaCost: "{2}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colorless: true }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});
