import { defineCard } from "../define.js";

const MOUNTAIN_TEXT = "This creature gets +1/+1 as long as you control a Mountain.";
const PLAINS_TEXT = "This creature gets +1/+1 as long as you control a Plains.";

export default defineCard({
  name: "Wild Nacatl",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${MOUNTAIN_TEXT}\n${PLAINS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: MOUNTAIN_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: PLAINS_TEXT,
    },
  ],
});
